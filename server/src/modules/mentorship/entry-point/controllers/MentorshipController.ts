import { Request, Response } from 'express';
import { MentorshipMapper } from '../../application/mappers/MentorshipMapper';
import { SlotStatus } from '../../domain/entities/MentorshipSlot';
import { ICreateSlotUseCase } from '../../application/interfaces/ISlotUseCases';
import { IGetInstructorSlotsUseCase } from '../../application/interfaces/ISlotUseCases';
import { IUpdateSlotUseCase } from '../../application/interfaces/ISlotUseCases';
import { IDeleteSlotUseCase } from '../../application/interfaces/ISlotUseCases';
import { IGetSlotsByJobTitleUseCase } from '../../application/interfaces/ISlotUseCases';
import { IGetAvailableSlotsUseCase } from '../../application/interfaces/ISlotUseCases';
import { IGetUniqueTagsUseCase } from '../../application/interfaces/ISlotUseCases';
import {
  IBookSlotUseCase,
  ICancelBookingUseCase,
  IGetStudentBookingsUseCase,
  IGetInstructorBookingsUseCase,
  IGenerateVideoRoomUseCase,
  IValidateVideoRoomAccessUseCase,
} from '../../application/interfaces/IBookingUseCases';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { HttpError } from '../../../../shared/types/HttpError';
import logger from '../../../../shared/utils/Logger';
import { AuthenticatedRequest } from '../../../../shared/types/AuthenticatedRequestType';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';

export class MentorshipController {
  constructor(
    private _createSlotUseCase: ICreateSlotUseCase,
    private _getInstructorSlotsUseCase: IGetInstructorSlotsUseCase,
    private _updateSlotUseCase: IUpdateSlotUseCase,
    private _deleteSlotUseCase: IDeleteSlotUseCase,
    private _getSlotsByJobTitleUseCase: IGetSlotsByJobTitleUseCase,
    private _getAvailableSlotsUseCase: IGetAvailableSlotsUseCase,
    private _getUniqueTagsUseCase: IGetUniqueTagsUseCase,
    private _bookSlotUseCase: IBookSlotUseCase,
    private _cancelBookingUseCase: ICancelBookingUseCase,
    private _getStudentBookingsUseCase: IGetStudentBookingsUseCase,
    private _getInstructorBookingsUseCase: IGetInstructorBookingsUseCase,
    private _generateVideoRoomUseCase: IGenerateVideoRoomUseCase,
    private _validateVideoRoomAccessUseCase: IValidateVideoRoomAccessUseCase,
  ) {}

  /**
   * Creates a new mentorship slot for an instructor.
   */
  createSlot = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const instructorId = authenticatedReq.user.id;

    logger.info(`Create slot attempt from instructor: ${instructorId}`);
    const slotDto = MentorshipMapper.toCreateSlotDto(
      authenticatedReq.body,
      instructorId,
    );
    const slot = await this._createSlotUseCase.execute(slotDto);

    logger.info(`Slot created successfully: ${slot.slotId}`);
    ApiResponseHelper.created(res, 'Mentorship slot created successfully', {
      slot,
    });
  };

  /**
   * Retrieves all slots for the authenticated instructor.
   */
  getInstructorSlots = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const instructorId = authenticatedReq.user.id;
    const { status, fromDate, toDate, page, limit } = req.query;

    const filters = {
      status: status as SlotStatus | undefined,
      fromDate: fromDate ? new Date(fromDate as string) : undefined,
      toDate: toDate ? new Date(toDate as string) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20, // Default to a reasonable number
    };

    const slots = await this._getInstructorSlotsUseCase.execute(
      instructorId,
      filters,
    );
    ApiResponseHelper.success(res, 'Slots retrieved successfully', { slots });
  };

  /**
   * Updates an existing mentorship slot.
   */
  updateSlot = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const { slotId } = authenticatedReq.params;
    const instructorId = authenticatedReq.user.id;

    if (!slotId) {
      throw new HttpError('Slot ID is required', HttpStatusCode.BAD_REQUEST);
    }

    const slotDto = MentorshipMapper.toUpdateSlotDto(authenticatedReq.body);
    const updatedSlot = await this._updateSlotUseCase.execute(slotId, slotDto);

    if (!updatedSlot) {
      throw new HttpError('Slot not found', HttpStatusCode.NOT_FOUND);
    }

    logger.info(`Slot updated by instructor ${instructorId}: ${slotId}`);
    ApiResponseHelper.success(res, 'Slot updated successfully', {
      slot: updatedSlot,
    });
  };

  /**
   * Deletes a mentorship slot.
   */
  deleteSlot = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const { slotId } = authenticatedReq.params;
    const instructorId = authenticatedReq.user.id;

    if (!slotId) {
      throw new HttpError('Slot ID is required', HttpStatusCode.BAD_REQUEST);
    }

    await this._deleteSlotUseCase.execute(slotId);

    logger.info(`Slot deleted by instructor ${instructorId}: ${slotId}`);
    ApiResponseHelper.success(res, 'Slot deleted successfully');
  };

  /**
   * Retrieves available slots filtered by job title.
   */
  getSlotsByJobTitle = async (req: Request, res: Response): Promise<void> => {
    const { jobTitle } = req.params;

    if (!jobTitle) {
      throw new HttpError('Job title is required', HttpStatusCode.BAD_REQUEST);
    }

    const slots = await this._getSlotsByJobTitleUseCase.execute(jobTitle);
    ApiResponseHelper.success(res, 'Slots retrieved successfully', { slots });
  };

  /**
   * Retrieves unique tags from available mentorship slots.
   */
  getUniqueTags = async (req: Request, res: Response): Promise<void> => {
    const tags = await this._getUniqueTagsUseCase.execute();
    ApiResponseHelper.success(res, 'Tags retrieved successfully', { tags });
  };

  /**
   * Retrieves all available slots with optional filters.
   */
  getAvailableSlots = async (req: Request, res: Response): Promise<void> => {
    const {
      search,
      jobTitle,
      minPrice,
      maxPrice,
      fromDate,
      toDate,
      tags,
      page,
      limit,
    } = req.query;

    // Parse tags safely (handle comma-separated string or array)
    let parsedTags: string[] | undefined;
    if (tags) {
      if (Array.isArray(tags)) {
        parsedTags = tags as string[];
      } else {
        parsedTags = (tags as string).split(',');
      }
    }

    const filters = {
      search: search as string | undefined, // Mapping search param
      jobTitle: jobTitle as string | undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      fromDate: fromDate ? new Date(fromDate as string) : undefined,
      toDate: toDate ? new Date(toDate as string) : undefined,
      tags: parsedTags,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    };
    // logger.info(`Fetching slots with filters: ${JSON.stringify(filters)}`);
    const slots = await this._getAvailableSlotsUseCase.execute(filters);
    ApiResponseHelper.success(res, 'Available slots retrieved successfully', {
      slots,
    });
  };

  /**
   * Books a mentorship slot and initiates payment.
   */
  bookSlot = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const studentId = authenticatedReq.user.id;
    const { slotId, providerName } = req.body;

    if (!slotId || !providerName) {
      throw new HttpError(
        'Slot ID and Provider Name are required',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const { booking, providerResponse } = await this._bookSlotUseCase.execute({
      slotId,
      studentId,
      providerName,
    });

    ApiResponseHelper.success(
      res,
      'Slot booked successfully. Proceed to payment.',
      {
        bookingId: booking.bookingId, // Assuming entity has it, or use return from create
        paymentInfo: providerResponse,
      },
    );
  };

  /**
   * Cancels a booking.
   */
  cancelBooking = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const { bookingId } = req.params;
    const role = authenticatedReq.user.role; // 'student' or 'instructor'

    // Validate cancelledBy
    if (role !== 'student' && role !== 'instructor') {
      throw new HttpError('Invalid role', HttpStatusCode.FORBIDDEN);
    }

    await this._cancelBookingUseCase.execute({
      bookingId,
      cancelledBy: role,
    });

    ApiResponseHelper.success(res, 'Booking cancelled successfully', null);
  };

  /**
   * Gets bookings for the authenticated student.
   */
  getStudentBookings = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const studentId = authenticatedReq.user.id;
    const { page, limit, status, fromDate, toDate } = req.query;

    const bookings = await this._getStudentBookingsUseCase.execute(
      studentId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      status as string,
      fromDate ? new Date(fromDate as string) : undefined,
      toDate ? new Date(toDate as string) : undefined,
    );
    ApiResponseHelper.success(res, 'Student bookings retrieved successfully', {
      bookings,
    });
  };

  /**
   * Gets bookings for the authenticated instructor.
   */
  getInstructorBookings = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const instructorId = authenticatedReq.user.id;
    const { page, limit, status } = req.query;

    const bookings = await this._getInstructorBookingsUseCase.execute(
      instructorId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      status as string,
    );
    ApiResponseHelper.success(
      res,
      'Instructor bookings retrieved successfully',
      { bookings },
    );
  };

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

    const result = await this._validateVideoRoomAccessUseCase.execute(
      roomId,
      userId,
      userRole,
    );

    ApiResponseHelper.success(res, 'Video room access validated', result);
  };
}
