import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import {
  IGenerateVideoRoomUseCase,
  IValidateVideoRoomAccessUseCase,
} from '../../application/interfaces/IBookingUseCases';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { HttpError } from '../../../../shared/types/HttpError';
import { AuthenticatedRequest } from '../../../../shared/types/AuthenticatedRequestType';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import { MeteredTurnService } from '../../../../shared/services/video-signaling/MeteredTurnService';

export class MentorshipVideoController {
  constructor(
    private _generateVideoRoomUseCase: IGenerateVideoRoomUseCase,
    private _validateVideoRoomAccessUseCase: IValidateVideoRoomAccessUseCase,
    private _meteredTurnService: MeteredTurnService,
  ) {}

  /**
   * Generates a video room for a confirmed booking.
   */
  generateVideoRoom = async (req: Request, res: Response): Promise<void> => {
    const { bookingId } = req.params;

    if (!bookingId) {
      throw new HttpError('Booking ID is required', HttpStatusCode.BAD_REQUEST);
    }

    const { roomId, roomUrl } =
      await this._generateVideoRoomUseCase.execute(bookingId);

    ApiResponseHelper.success(res, 'Video room generated successfully', {
      roomId,
      roomUrl,
    });
  };

  /**
   * Validates video room access for a user.
   */
  validateVideoRoomAccess = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const { roomId } = req.params;
    const userId = authenticatedReq.user.id;
    const userRole = authenticatedReq.user.role;

    if (!roomId) {
      throw new HttpError('Room ID is required', HttpStatusCode.BAD_REQUEST);
    }

    if (userRole !== 'student' && userRole !== 'instructor') {
      throw new HttpError('Invalid user role', HttpStatusCode.FORBIDDEN);
    }

    const result = await this._validateVideoRoomAccessUseCase.execute({
      roomId,
      userId,
      userRole: userRole as 'student' | 'instructor',
    });

    const roomToken = jwt.sign(
      {
        purpose: 'video-room',
        roomId,
        bookingId: result.bookingId,
        userId,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '2h' },
    );

    ApiResponseHelper.success(res, 'Video room access validated', {
      ...result,
      roomToken,
      iceServers: this._meteredTurnService.getIceServers(),
    });
  };
}
