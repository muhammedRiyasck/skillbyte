import { Request, Response } from 'express';
import { MentorshipMapper } from '../../application/mappers/MentorshipMapper';
import { ICreateSlotUseCase } from '../../application/interfaces/ISlotUseCases';
import { IGetInstructorSlotsUseCase } from '../../application/interfaces/ISlotUseCases';
import { IUpdateSlotUseCase } from '../../application/interfaces/ISlotUseCases';
import { IDeleteSlotUseCase } from '../../application/interfaces/ISlotUseCases';
import { IGetSlotsByJobTitleUseCase } from '../../application/interfaces/ISlotUseCases';
import { IGetAvailableSlotsUseCase } from '../../application/interfaces/ISlotUseCases';
import {
  IBookSlotUseCase,
  ICancelBookingUseCase,
  IGetStudentBookingsUseCase,
  IGetInstructorBookingsUseCase,
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
    private _bookSlotUseCase: IBookSlotUseCase,
    private _cancelBookingUseCase: ICancelBookingUseCase,
    private _getStudentBookingsUseCase: IGetStudentBookingsUseCase,
    private _getInstructorBookingsUseCase: IGetInstructorBookingsUseCase,
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

    const slots = await this._getInstructorSlotsUseCase.execute(instructorId);
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

    // TODO: Verify instructor owns the slot
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

    // TODO: Verify instructor owns the slot before deleting
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
   * Retrieves all available slots with optional filters.
   */
  getAvailableSlots = async (req: Request, res: Response): Promise<void> => {
    const { jobTitle, minPrice, maxPrice, fromDate, toDate, tags } = req.query;

    const filters = {
      jobTitle: jobTitle as string | undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      fromDate: fromDate ? new Date(fromDate as string) : undefined,
      toDate: toDate ? new Date(toDate as string) : undefined,
      tags: tags ? (tags as string).split(',') : undefined,
    };

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

    // Validate role? Middleware does it.

    const bookings = await this._getStudentBookingsUseCase.execute(studentId);
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

    const bookings =
      await this._getInstructorBookingsUseCase.execute(instructorId);
    ApiResponseHelper.success(
      res,
      'Instructor bookings retrieved successfully',
      { bookings },
    );
  };
}
