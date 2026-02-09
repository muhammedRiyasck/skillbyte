import { IGenerateVideoRoomUseCase } from '../interfaces/IBookingUseCases';
import { IMentorshipBookingRepository } from '../../domain/IRepositories/IMentorshipBookingRepository';
import logger from '../../../../shared/utils/Logger';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

export class GenerateVideoRoomUseCase implements IGenerateVideoRoomUseCase {
  constructor(private bookingRepo: IMentorshipBookingRepository) {}

  async execute(
    bookingId: string,
  ): Promise<{ roomId: string; roomUrl: string }> {
    logger.info(`Generating video room for booking: ${bookingId}`);

    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new HttpError('Booking not found', HttpStatusCode.NOT_FOUND);
    }

    if (booking.status !== 'confirmed') {
      throw new HttpError(
        'Video room can only be generated for confirmed bookings',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    // If room already exists, return it
    if (booking.videoRoomId && booking.videoRoomUrl) {
      return {
        roomId: booking.videoRoomId,
        roomUrl: booking.videoRoomUrl,
      };
    }

    // Generate unique room ID
    // Format: skillbyte-mentorship-<bookingId>-<tokening>
    const uniqueToken = crypto
      .getRandomValues(new Uint32Array(1))[0]
      .toString(36);
    const roomId = `skillbyte-mentorship-${bookingId}-${uniqueToken}`;
    const roomUrl = `/video-call/${roomId}`; // Internal app route

    // Save to database
    await this.bookingRepo.setVideoRoom(bookingId, roomId, roomUrl);

    logger.info(`Video room generated: ${roomId}`);

    return { roomId, roomUrl };
  }
}
