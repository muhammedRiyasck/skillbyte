import { Request, Response } from 'express';
import { InstructorMapper } from '../../application/mappers/InstructorMapper';
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
import { AdminInstructorMapper } from '../../application/mappers/AdminInstructorMapper';
import { IStorageService } from '../../../../shared/services/file-upload/interfaces/IStorageService';
import {
  AdminInstructorPaginationValidationType,
  ApproveInstructorValidationType,
  DeclineInstructorValidationType,
  ChangeInstructorStatusValidationType,
} from '../validations/AdminInstructorValidation';

/**
 * Controller for admin operations on instructors.
 * Handles listing, approving, declining, status changes, and deletion of instructors.
 */
export class AdminInstructorController {
  constructor(
    private _listInstructorsUC: IlistInstructorsUC,
    private _approveUC: IApproveInstructorUseCase,
    private _declineUC: IDeclineInstructorUseCase,
    private _changeStatusUC: IChangeInstructorStatusUseCase,
    private _deleteInstructorUC: IDeleteInstructorUseCase,
    private _storageService: IStorageService,
  ) {}

  getInstructors = async (req: Request, res: Response): Promise<void> => {
    const query =
      req.query as unknown as AdminInstructorPaginationValidationType;
    const filter = AdminInstructorMapper.toGetInstructorsFilter(query);
    const sort = AdminInstructorMapper.toSort(query.sort);

    const instructors = await this._listInstructorsUC.execute(
      filter,
      query.page ?? 1,
      query.limit ?? 12,
      sort,
    );
    const instructorDtos =
      instructors?.data?.map((instructor) =>
        InstructorMapper.toResponseDto(instructor),
      ) || [];

    ApiResponseHelper.success(res, 'Instructors retrieved successfully', {
      ...instructors,
      data: instructorDtos,
    });
  };

  approve = async (req: Request, res: Response): Promise<void> => {
    const AuthenticatedReq = req as AuthenticatedRequest;
    const dto = req.body as ApproveInstructorValidationType;
    const adminId = AuthenticatedReq.user.id;

    await this._approveUC.execute(dto.id, adminId);
    ApiResponseHelper.success(res, 'Instructor approved');
  };

  decline = async (req: Request, res: Response): Promise<void> => {
    const AuthenticatedReq = req as AuthenticatedRequest;
    const dto = req.body as DeclineInstructorValidationType;
    const adminId = AuthenticatedReq.user.id;

    await this._declineUC.execute(dto.id, adminId, dto.reason);
    ApiResponseHelper.success(res, 'Instructor declined', {
      note: dto.reason,
    });
  };

  changeInstructorStatus = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const { id } = req.params;
    const dto = req.body as ChangeInstructorStatusValidationType;

    await this._changeStatusUC.execute(id, dto.status, dto.reason);
    ApiResponseHelper.success(
      res,
      `Instructor account status changed to ${dto.status}`,
    );
  };

  deleteInstructor = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await this._deleteInstructorUC.execute(id);
    ApiResponseHelper.success(res, 'Instructor deleted successfully');
  };

  getInstructorResume = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const instructors = await this._listInstructorsUC.execute(
      { _id: id },
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

    const fileKey = instructor.resumeUrl;
    const freshSignedUrl = await this._storageService.getSignedUrl(fileKey);
    const fileResponse = await fetch(freshSignedUrl);

    if (!fileResponse.ok)
      throw new HttpError(
        'Failed to fetch file from Backblaze',
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );

    res.setHeader(
      'Content-Type',
      fileResponse.headers.get('content-type') || 'application/pdf',
    );
    res.setHeader('Content-Disposition', 'inline');

    const nodeStream = Readable.fromWeb(
      fileResponse.body as import('stream/web').ReadableStream,
    );
    nodeStream.pipe(res);
  };
}
