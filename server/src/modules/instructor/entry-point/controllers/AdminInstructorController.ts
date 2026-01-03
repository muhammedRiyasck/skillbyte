import { Request, Response } from 'express';
import { Readable } from 'node:stream';
import { IlistInstructorsUC } from '../../application/interfaces/IlistInstructorsUseCase';
import { IApproveInstructorUseCase } from '../../application/interfaces/IApproveInstructorUseCase';
import { IDeclineInstructorUseCase } from '../../application/interfaces/IDeclineInstructorUseCase';
import { IChangeInstructorStatusUseCase } from '../../application/interfaces/IChangeInstructorStatusUseCase';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { IDeleteInstructorUseCase } from '../../application/interfaces/IDeleteInstructorUseCase';
import { AuthenticatedRequest } from '../../../../shared/types/AuthenticatedRequestType';
import { HttpError } from '../../../../shared/types/HttpError';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import {
  AdminInstructorPaginationSchema,
  ApproveInstructorSchema,
  DeclineInstructorSchema,
  ChangeInstructorStatusSchema,
} from '../../application/dtos/AdminInstructorDtos';
import { AdminInstructorMapper } from '../../application/mappers/AdminInstructorMapper';
import { IStorageService } from '../../../../shared/services/file-upload/interfaces/IStorageService';

/**
 * Controller for admin operations on instructors.
 * Handles listing, approving, declining, status changes, and deletion of instructors.
 */
export class AdminInstructorController {
  /**
   * Constructs the AdminInstructorController.
   * @param listInstructorsUC - Use case for listing instructors.
   * @param approveUC - Use case for approving instructors.
   * @param declineUC - Use case for declining instructors.
   * @param changeStatusUC - Use case for changing instructor status.
   * @param deleteInstructorUC - Use case for deleting instructors.
   */
  constructor(
    private _listInstructorsUC: IlistInstructorsUC,
    private _approveUC: IApproveInstructorUseCase,
    private _declineUC: IDeclineInstructorUseCase,
    private _changeStatusUC: IChangeInstructorStatusUseCase,
    private _deleteInstructorUC: IDeleteInstructorUseCase,
    private _storageService: IStorageService,
  ) {}

  /**
   * Retrieves a paginated list of instructors based on status filter.
   * @param req - Express request object with query parameters.
   * @param res - Express response object.
   */
  getInstructors = async (req: Request, res: Response): Promise<void> => {
    const validatedQuery = AdminInstructorPaginationSchema.parse(req.query);
    const query = AdminInstructorMapper.toGetInstructorsFilter(validatedQuery);
    const sort = AdminInstructorMapper.toSort(validatedQuery.sort);

    const instructors = await this._listInstructorsUC.execute(
      query,
      validatedQuery.page,
      validatedQuery.limit,
      sort,
    );
    ApiResponseHelper.success(
      res,
      'Instructors retrieved successfully',
      instructors,
    );
  };

  /**
   * Approves an instructor application.
   * @param req - Authenticated request object with instructor ID in body.
   * @param res - Express response object.
   */
  approve = async (req: Request, res: Response): Promise<void> => {
    const AuthenticatedRequest = req as AuthenticatedRequest;
    const validatedData = ApproveInstructorSchema.parse(
      AuthenticatedRequest.body,
    );
    const adminId = AuthenticatedRequest.user.id;

    await this._approveUC.execute(validatedData.instructorId, adminId);
    ApiResponseHelper.success(res, 'Instructor approved');
  };

  /**
   * Declines an instructor application with a reason.
   * @param req - Authenticated request object with instructor ID and reason in body.
   * @param res - Express response object.
   */
  decline = async (req: Request, res: Response): Promise<void> => {
    const AuthenticatedRequest = req as AuthenticatedRequest;
    const validatedData = DeclineInstructorSchema.parse(
      AuthenticatedRequest.body,
    );
    const adminId = AuthenticatedRequest.user.id;

    await this._declineUC.execute(
      validatedData.instructorId,
      adminId,
      validatedData.reason,
    );
    ApiResponseHelper.success(res, 'Instructor declined', {
      note: validatedData.reason,
    });
  };

  /**
   * Changes the status of an instructor (activate or suspend).
   * @param req - Request object with instructor ID in params and status/reason in body.
   * @param res - Express response object.
   */
  changeInstructorStatus = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const { instructorId } = req.params;
    const validatedData = ChangeInstructorStatusSchema.parse(req.body);

    await this._changeStatusUC.execute(
      instructorId,
      validatedData.status,
      validatedData.reason,
    );
    ApiResponseHelper.success(
      res,
      `Instructor account status changed to ${validatedData.status}`,
    );
  };

  /**
   * Deletes an instructor by ID.
   * @param req - Request object with instructor ID in params.
   * @param res - Express response object.
   */
  deleteInstructor = async (req: Request, res: Response): Promise<void> => {
    const { instructorId } = req.params;
    await this._deleteInstructorUC.execute(instructorId);
    ApiResponseHelper.success(res, 'Instructor deleted successfully');
  };

  /**
   * Retrieves the resume URL for a specific instructor.
   * @param req - Request object with instructor ID in params.
   * @param res - Express response object.
   */
  getInstructorResume = async (req: Request, res: Response): Promise<void> => {
    const { instructorId } = req.params;

    // Get instructor details to retrieve resume URL
    const instructors = await this._listInstructorsUC.execute(
      { _id: instructorId },
      1,
      1,
      {},
    );
    if (!instructors || !instructors.data || instructors.data.length === 0) {
      throw new HttpError(
        ERROR_MESSAGES.INSTRUCTOR_NOT_FOUND,
        HttpStatusCode.NOT_FOUND,
      );
    }

    const instructor = instructors.data[0];
    if (!instructor.resumeUrl) {
      throw new HttpError(
        ERROR_MESSAGES.RESUME_NOT_FOUND,
        HttpStatusCode.NOT_FOUND,
      );
    }

    // The resumeUrl is now the file key (e.g., "instructor-resumes/filename.pdf")
    const fileKey = instructor.resumeUrl;

    // Generate a fresh signed URL with 1 hour expiration
    const freshSignedUrl = await this._storageService.getSignedUrl(fileKey);

    const fileResponse = await fetch(freshSignedUrl);

    if (!fileResponse.ok)
      throw new Error('Failed to fetch file from Backblaze');

    // 5. Set headers to view inline
    res.setHeader(
      'Content-Type',
      fileResponse.headers.get('content-type') || 'application/pdf',
    );
    res.setHeader('Content-Disposition', 'inline');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nodeStream = Readable.fromWeb(fileResponse.body as any);
    nodeStream.pipe(res);
  };
}
