import { Request, Response } from 'express';
import { RequestWithdrawalUseCase } from '../../application/use-cases/RequestWithdrawalUseCase';
import { ProcessWithdrawalUseCase } from '../../application/use-cases/ProcessWithdrawalUseCase';
import { RejectWithdrawalUseCase } from '../../application/use-cases/RejectWithdrawalUseCase';
import { IWithdrawalRepository } from '../../domain/IRepositories/IWithdrawalRepository';
import { WithdrawalResponseMapper } from '../../application/mappers/WithdrawalResponseMapper';
import { AuthenticatedRequest } from '../../../../shared/types/AuthenticatedRequestType';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';

export class WithdrawalController {
  constructor(
    private requestWithdrawalUseCase: RequestWithdrawalUseCase,
    private processWithdrawalUseCase: ProcessWithdrawalUseCase,
    private rejectWithdrawalUseCase: RejectWithdrawalUseCase,
    private withdrawalRepo: IWithdrawalRepository,
  ) {}

  requestWithdrawal = async (req: Request, res: Response): Promise<void> => {
    const instructorId = (req as AuthenticatedRequest).user.id;

    const result = await this.requestWithdrawalUseCase.execute({
      instructorId,
      amount: req.body.amount,
      payoutMethod: req.body.payoutMethod || 'STRIPE',
    });

    ApiResponseHelper.created(
      res,
      'Withdrawal request submitted successfully',
      result,
    );
  };

  getMyWithdrawals = async (req: Request, res: Response): Promise<void> => {
    const instructorId = (req as AuthenticatedRequest).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await this.withdrawalRepo.findByInstructorId(
      instructorId,
      page,
      limit,
    );

    ApiResponseHelper.success(res, 'Withdrawals fetched', {
      data: result.data.map(WithdrawalResponseMapper.toResponseDto),
      pagination: { total: result.total, page, limit },
    });
  };

  getAllWithdrawals = async (req: Request, res: Response): Promise<void> => {
    const { status, search } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const filter =
      status && status !== 'all' && status !== 'ALL' ? { status } : {};
    const result = await this.withdrawalRepo.findAll(
      filter,
      page,
      limit,
      search as string,
    );

    ApiResponseHelper.success(res, 'Withdrawals fetched', {
      data: result.data.map(WithdrawalResponseMapper.toResponseDto),
      pagination: { total: result.total, page, limit },
    });
  };

  processWithdrawal = async (req: Request, res: Response): Promise<void> => {
    const { withdrawalId } = req.params;
    const { adminNotes } = req.body;

    const result = await this.processWithdrawalUseCase.execute(
      { withdrawalId },
      adminNotes,
    );

    ApiResponseHelper.success(res, 'Withdrawal processed successfully', result);
  };

  rejectWithdrawal = async (req: Request, res: Response): Promise<void> => {
    const { withdrawalId } = req.params;
    const { reason } = req.body;

    const result = await this.rejectWithdrawalUseCase.execute({
      withdrawalId,
      reason,
    });

    ApiResponseHelper.success(
      res,
      'Withdrawal request rejected successfully',
      result,
    );
  };
}
