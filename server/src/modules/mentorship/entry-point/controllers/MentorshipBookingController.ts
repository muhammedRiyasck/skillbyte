import { Request, Response } from 'express';
import {
  IBookSlotUseCase,
  ICancelBookingUseCase,
  IGetStudentBookingsUseCase,
  IGetInstructorBookingsUseCase,
  IGetResumePaymentUseCase,
  IRescheduleBookingUseCase,
} from '../../application/interfaces/IBookingUseCases';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { HttpError } from '../../../../shared/types/HttpError';
import { AuthenticatedRequest } from '../../../../shared/types/AuthenticatedRequestType';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';

export class MentorshipBookingController {
  constructor(
    private _bookSlotUseCase: IBookSlotUseCase,
    private _cancelBookingUseCase: ICancelBookingUseCase,
    private _getStudentBookingsUseCase: IGetStudentBookingsUseCase,
    private _getInstructorBookingsUseCase: IGetInstructorBookingsUseCase,
    private _getResumePaymentUseCase: IGetResumePaymentUseCase,
    private _rescheduleBookingUseCase: IRescheduleBookingUseCase,
  ) {}

  /**
   * Books a mentorship slot and initiates payment.
   */
  bookSlot = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const studentId = authenticatedReq.user.id;
    const { slotId, providerName } = req.body;

    if (!slotId) {
      throw new HttpError('Slot ID is required', HttpStatusCode.BAD_REQUEST);
    }

    const { booking, providerResponse } = await this._bookSlotUseCase.execute({
      slotId,
      studentId,
      providerName: providerName || 'free',
    });

    ApiResponseHelper.success(
      res,
      'Slot booked successfully. Proceed to payment.',
      {
        bookingId: booking.bookingId,
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
    const role = authenticatedReq.user.role;

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

    const bookings = await this._getStudentBookingsUseCase.execute({
      studentId,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      status: status as string,
      fromDate: fromDate ? new Date(fromDate as string) : undefined,
      toDate: toDate ? new Date(toDate as string) : undefined,
    });
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
    const { page, limit, status, upcoming } = req.query;

    const bookings = await this._getInstructorBookingsUseCase.execute({
      instructorId,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      status: status as string,
      upcoming: upcoming === 'true',
    });
    ApiResponseHelper.success(
      res,
      'Instructor bookings retrieved successfully',
      { bookings },
    );
  };

  /**
   * Returns the Stripe client_secret for a PENDING booking so the
   * student can resume their interrupted Stripe checkout.
   */
  getResumePayment = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const studentId = authenticatedReq.user.id;
    const { bookingId } = req.params;

    if (!bookingId) {
      throw new HttpError('Booking ID is required', HttpStatusCode.BAD_REQUEST);
    }

    const result = await this._getResumePaymentUseCase.execute(
      bookingId,
      studentId,
    );

    ApiResponseHelper.success(
      res,
      'Payment secret retrieved successfully',
      result,
    );
  };

  /**
   * Reschedules a confirmed mentorship booking (instructor only).
   */
  rescheduleBooking = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const instructorId = authenticatedReq.user.id;
    const { bookingId } = req.params;
    const { newScheduledAt, reason } = req.body;

    if (!bookingId) {
      throw new HttpError('Booking ID is required', HttpStatusCode.BAD_REQUEST);
    }

    const booking = await this._rescheduleBookingUseCase.execute({
      bookingId,
      instructorId,
      newScheduledAt: new Date(newScheduledAt),
      reason,
    });

    ApiResponseHelper.success(
      res,
      'Mentorship session rescheduled successfully',
      { booking },
    );
  };
}
