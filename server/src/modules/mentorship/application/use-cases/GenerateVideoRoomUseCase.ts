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
    // Format: skillbyte-mentorship-<bookingId>-<randomString>
    const randomStr = Math.random().toString(36).substring(7);
    const roomId = `skillbyte-mentorship-${bookingId}-${randomStr}`;
    const roomUrl = `https://meet.jit.si/${roomId}`;

    // Save to database
    await this.bookingRepo.setVideoRoom(bookingId, roomId, roomUrl);

    logger.info(`Video room generated: ${roomId}`);

    return { roomId, roomUrl };
  }
}
