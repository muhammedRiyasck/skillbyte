import { Request, Response } from 'express';
import { SlotStatus } from '../../domain/entities/MentorshipSlot';
import {
  ICreateSlotUseCase,
  ICreateRecurringSlotsUseCase,
  IDeleteRecurringSlotsUseCase,
  IGetInstructorSlotsUseCase,
  IUpdateSlotUseCase,
  IDeleteSlotUseCase,
  IGetSlotsByJobTitleUseCase,
  IGetAvailableSlotsUseCase,
  IGetUniqueTagsUseCase,
} from '../../application/interfaces/ISlotUseCases';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { HttpError } from '../../../../shared/types/HttpError';
import logger from '../../../../shared/utils/Logger';
import { AuthenticatedRequest } from '../../../../shared/types/AuthenticatedRequestType';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';

/** Handles HTTP requests for mentorship slot operations. */
export class MentorshipSlotController {
  constructor(
    private _createSlotUseCase: ICreateSlotUseCase,
    private _getInstructorSlotsUseCase: IGetInstructorSlotsUseCase,
    private _updateSlotUseCase: IUpdateSlotUseCase,
    private _deleteSlotUseCase: IDeleteSlotUseCase,
    private _getSlotsByJobTitleUseCase: IGetSlotsByJobTitleUseCase,
    private _getAvailableSlotsUseCase: IGetAvailableSlotsUseCase,
    private _getUniqueTagsUseCase: IGetUniqueTagsUseCase,
    private _createRecurringSlotsUseCase?: ICreateRecurringSlotsUseCase,
    private _deleteRecurringSlotsUseCase?: IDeleteRecurringSlotsUseCase,
  ) {}

  /**
   * Create slot for the MentorshipSlot entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  createSlot = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const instructorId = authenticatedReq.user.id;

    logger.info(`Create slot attempt from instructor: ${instructorId}`);
    const slotDto = {
      ...authenticatedReq.body,
      instructorId,
    };
    const slot = await this._createSlotUseCase.execute(slotDto);

    logger.info(`Slot created successfully: ${slot.slotId}`);
    ApiResponseHelper.created(res, 'Mentorship slot created successfully', {
      slot,
    });
  };

  /**
   * Create recurring slots for the MentorshipSlot entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  createRecurringSlots = async (req: Request, res: Response): Promise<void> => {
    if (!this._createRecurringSlotsUseCase) {
      throw new HttpError(
        'Create recurring slots use case not initialized',
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }

    const authenticatedReq = req as AuthenticatedRequest;
    const instructorId = authenticatedReq.user.id;

    logger.info(
      `Create recurring slots attempt from instructor: ${instructorId}`,
    );
    const dto = {
      ...authenticatedReq.body,
      instructorId,
    };
    const result = await this._createRecurringSlotsUseCase.execute(dto);

    logger.info(
      `Recurring slots created: ${result.createdCount} created, ${result.skippedCount} skipped for group ${result.recurrenceGroupId}`,
    );
    ApiResponseHelper.created(
      res,
      'Recurring mentorship slots created successfully',
      result,
    );
  };

  /**
   * Delete recurring slots for the MentorshipSlot entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  deleteRecurringSlots = async (req: Request, res: Response): Promise<void> => {
    if (!this._deleteRecurringSlotsUseCase) {
      throw new HttpError(
        'Delete recurring slots use case not initialized',
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }

    const authenticatedReq = req as AuthenticatedRequest;
    const instructorId = authenticatedReq.user.id;
    const { recurrenceGroupId } = req.params;
    const onlyUpcoming = req.query.onlyUpcoming !== 'false';

    logger.info(
      `Delete recurring slots group ${recurrenceGroupId} from instructor: ${instructorId}`,
    );
    const result = await this._deleteRecurringSlotsUseCase.execute(
      recurrenceGroupId,
      instructorId,
      onlyUpcoming,
    );

    ApiResponseHelper.success(
      res,
      'Recurring mentorship slots deleted successfully',
      result,
    );
  };

  /**
   * Get instructor slots for the MentorshipSlot entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
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
      limit: limit ? Number(limit) : 20,
    };

    const slots = await this._getInstructorSlotsUseCase.execute({
      instructorId,
      filters,
    });
    ApiResponseHelper.success(res, 'Slots retrieved successfully', { slots });
  };

  /**
   * Update slot for the MentorshipSlot entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  updateSlot = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const { slotId } = authenticatedReq.params;
    const instructorId = authenticatedReq.user.id;

    if (!slotId) {
      throw new HttpError('Slot ID is required', HttpStatusCode.BAD_REQUEST);
    }

    const slotDto = authenticatedReq.body;
    const updatedSlot = await this._updateSlotUseCase.execute({
      slotId,
      data: slotDto,
    });

    if (!updatedSlot) {
      throw new HttpError('Slot not found', HttpStatusCode.NOT_FOUND);
    }

    logger.info(`Slot updated by instructor ${instructorId}: ${slotId}`);
    ApiResponseHelper.success(res, 'Slot updated successfully', {
      slot: updatedSlot,
    });
  };

  /**
   * Delete slot for the MentorshipSlot entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
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
   * Get slots by job title for the MentorshipSlot entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
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
   * Get unique tags for the MentorshipSlot entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  getUniqueTags = async (req: Request, res: Response): Promise<void> => {
    const tags = await this._getUniqueTagsUseCase.execute();
    ApiResponseHelper.success(res, 'Tags retrieved successfully', { tags });
  };

  /**
   * Get available slots for the MentorshipSlot entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
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

    let parsedTags: string[] | undefined;
    if (tags) {
      if (Array.isArray(tags)) {
        parsedTags = tags as string[];
      } else {
        parsedTags = (tags as string).split(',');
      }
    }

    const filters = {
      search: search as string | undefined,
      jobTitle: jobTitle as string | undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      fromDate: fromDate ? new Date(fromDate as string) : undefined,
      toDate: toDate ? new Date(toDate as string) : undefined,
      tags: parsedTags,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    };

    const authenticatedReq = req as AuthenticatedRequest;
    const studentId = authenticatedReq.user?.id;

    const slots = await this._getAvailableSlotsUseCase.execute(
      filters,
      studentId,
    );
    ApiResponseHelper.success(res, 'Available slots retrieved successfully', {
      slots,
    });
  };
}
