import { Request, Response } from 'express';
import { IlistInstructorsUC } from '../../application/interfaces/IlistInstructorsUseCase';
import { IApproveInstructorUseCase } from '../../application/interfaces/IApproveInstructorUseCase';
import { IDeclineInstructorUseCase } from '../../application/interfaces/IDeclineInstructorUseCase';
import { IChangeInstructorStatusUseCase } from '../../application/interfaces/IChangeInstructorStatusUseCase';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { IDeleteInstructorUseCase } from '../../application/interfaces/IDeleteInstructorUseCase';
import { AuthenticatedRequest } from '../../../../shared/types/AuthenticatedRequestType';
import { HttpError } from '../../../../shared/types/HttpError';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import { getBackblazeSignedUrl } from '../../../../shared/utils/Backblaze';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';

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
  ) {}

  /**
   * Retrieves a paginated list of instructors based on status filter.
   * @param req - Express request object with query parameters.
   * @param res - Express response object.
   */
  getInstructors = async (req: Request, res: Response): Promise<void> => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;

    let query: Record<string, any> = {};
    const status = req.query.status as string;
    if (status?.trim() === 'Pending Instructors') {
      query = { accountStatus: 'pending' };
    } else if (status?.trim() === 'Approved Instructors') {
      query = { accountStatus: 'active', approved: true };
    } else if (status?.trim() === 'Rejected Instructors') {
      query = { accountStatus: 'rejected', rejected: true };
    } else if (status?.trim() === 'Suspended Instructors') {
      query = { accountStatus: 'suspended', approved: true };
    }

    let sort: Record<string, 1 | -1> = { createdAt: -1 };
    if (typeof req.query.sort === 'string') {
      const [field, dir] = (req.query.sort as string).split(':');
      sort = { [field]: dir === 'asc' ? 1 : -1 };
    }

    const instructors = await this._listInstructorsUC.execute(query, page, limit, sort);
    ApiResponseHelper.success(res, "Instructors retrieved successfully", instructors);
  };

  /**
   * Approves an instructor application.
   * @param req - Authenticated request object with instructor ID in body.
   * @param res - Express response object.
   */
  approve = async (req: Request, res: Response): Promise<void> => {
    const AuthenticatedRequest = req as AuthenticatedRequest;
    const instructorId = AuthenticatedRequest.body.instructorId;
    const adminId = AuthenticatedRequest.user.id;

    await this._approveUC.execute(instructorId, adminId);
    ApiResponseHelper.success(res, "Instructor approved");
  };

  /**
   * Declines an instructor application with a reason.
   * @param req - Authenticated request object with instructor ID and reason in body.
   * @param res - Express response object.
   */
  decline = async (req: Request, res: Response): Promise<void> => {
    const AuthenticatedRequest = req as AuthenticatedRequest;
    const instructorId = AuthenticatedRequest.body.instructorId;
    const adminId = AuthenticatedRequest.user.id;
    const { reason } = req.body;

    await this._declineUC.execute(instructorId, adminId, reason);
    ApiResponseHelper.success(res, "Instructor declined", { note: reason });
  };

  /**
   * Changes the status of an instructor (activate or suspend).
   * @param req - Request object with instructor ID in params and status/reason in body.
   * @param res - Express response object.
   */
  changeInstructorStatus = async (req: Request, res: Response): Promise<void> => {
    const { instructorId } = req.params;
    const { status, reason } = req.body;

    if (!['active', 'suspend'].includes(status)) {
      throw new HttpError(ERROR_MESSAGES.INVALID_STATUS, HttpStatusCode.BAD_REQUEST);
    }

    await this._changeStatusUC.execute(instructorId, status, reason);
    ApiResponseHelper.success(res, `Instructor account status changed to ${status}`);
  };

  /**
   * Deletes an instructor by ID.
   * @param req - Request object with instructor ID in params.
   * @param res - Express response object.
   */
  deleteInstructor = async (req: Request, res: Response): Promise<void> => {
    const { instructorId } = req.params;
    await this._deleteInstructorUC.execute(instructorId);
    ApiResponseHelper.success(res, "Instructor deleted successfully");
  };

  /**
   * Retrieves the resume URL for a specific instructor.
   * @param req - Request object with instructor ID in params.
   * @param res - Express response object.
   */
  getInstructorResume = async (req: Request, res: Response): Promise<void> => {
    const { instructorId } = req.params;

    // Get instructor details to retrieve resume URL
    const instructors = await this._listInstructorsUC.execute({ _id: instructorId }, 1, 1, {});
    if (!instructors || !instructors.data || instructors.data.length === 0) {
      throw new HttpError(ERROR_MESSAGES.INSTRUCTOR_NOT_FOUND, HttpStatusCode.NOT_FOUND);
    }

    const instructor = instructors.data[0];
    if (!instructor.resumeUrl) {
      throw new HttpError(ERROR_MESSAGES.RESUME_NOT_FOUND, HttpStatusCode.NOT_FOUND);
    }

    // The resumeUrl is now the file key (e.g., "instructor-resumes/filename.pdf")
    const fileKey = instructor.resumeUrl;

    // Generate a fresh signed URL with 1 hour expiration
    const freshSignedUrl = await getBackblazeSignedUrl(fileKey);

    // Redirect to the fresh signed URL
    res.redirect(freshSignedUrl);
  };
}
  