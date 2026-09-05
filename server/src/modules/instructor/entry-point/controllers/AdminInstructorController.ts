import { Request, Response } from 'express';
import { IlistInstructorsUC } from '../../application/interfaces/IlistInstructorsUseCase';
import { IApproveInstructorUseCase } from '../../application/interfaces/IApproveInstructorUseCase';
import { IDeclineInstructorUseCase } from '../../application/interfaces/IDeclineInstructorUseCase';
import { IChangeInstructorStatusUseCase } from '../../application/interfaces/IChangeInstructorStatusUseCase';
import { IDeleteInstructorUseCase } from '../../application/interfaces/IDeleteInstructorUseCase';
import { IStreamInstructorResumeUseCase } from '../../application/interfaces/IStreamInstructorResumeUseCase';
import { AuthenticatedRequest } from '../../../../shared/types/AuthenticatedRequestType';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import { AdminInstructorMapper } from '../../application/mappers/AdminInstructorMapper';
import {
  AdminInstructorPaginationRequestDto,
  ApproveInstructorRequestDto,
  DeclineInstructorRequestDto,
  ChangeInstructorStatusRequestDto,
} from '../../application/dtos/AdminInstructorRequestDto';

/**
 * Controller for admin operations on instructors.
 * Handles listing, approving, declining, status changes, deletion, and resume streaming.
 */
export class AdminInstructorController {
  constructor(
    private _listInstructorsUC: IlistInstructorsUC,
    private _approveUC: IApproveInstructorUseCase,
    private _declineUC: IDeclineInstructorUseCase,
    private _changeStatusUC: IChangeInstructorStatusUseCase,
    private _deleteInstructorUC: IDeleteInstructorUseCase,
    private _streamResumeUC: IStreamInstructorResumeUseCase,
  ) {}

  getInstructors = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as AdminInstructorPaginationRequestDto;
    const filter = AdminInstructorMapper.toGetInstructorsFilter(query);
    const sort = AdminInstructorMapper.toSort(query.sort);

    const instructors = await this._listInstructorsUC.execute(
      filter,
      query.page ?? 1,
      query.limit ?? 12,
      sort,
    );
    ApiResponseHelper.success(
      res,
      'Instructors retrieved successfully',
      instructors,
    );
  };

  approve = async (req: Request, res: Response): Promise<void> => {
    const AuthenticatedReq = req as AuthenticatedRequest;
    const dto = req.body as ApproveInstructorRequestDto;
    const adminId = AuthenticatedReq.user.id;

    await this._approveUC.execute(dto.id, adminId);
    ApiResponseHelper.success(res, 'Instructor approved');
  };

  decline = async (req: Request, res: Response): Promise<void> => {
    const AuthenticatedReq = req as AuthenticatedRequest;
    const dto = req.body as DeclineInstructorRequestDto;
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
    const dto = req.body as ChangeInstructorStatusRequestDto;

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
    const { stream, contentType } = await this._streamResumeUC.execute(id);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', 'inline');
    stream.pipe(res);
  };
}
