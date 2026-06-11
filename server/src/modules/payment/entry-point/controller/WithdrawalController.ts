import { Request, Response } from 'express';
import { RequestWithdrawalUseCase } from '../../application/use-cases/RequestWithdrawalUseCase';
import { ProcessWithdrawalUseCase } from '../../application/use-cases/ProcessWithdrawalUseCase';
import { RejectWithdrawalUseCase } from '../../application/use-cases/RejectWithdrawalUseCase';
import { IWithdrawalRepository } from '../../domain/IRepositories/IWithdrawalRepository';
import { WithdrawalResponseMapper } from '../../application/mappers/WithdrawalResponseMapper';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import logger from '../../../../shared/utils/Logger';
import { AuthenticatedRequest } from '../../../../shared/types/AuthenticatedRequestType';

export class WithdrawalController {
  constructor(
    private requestWithdrawalUseCase: RequestWithdrawalUseCase,
    private processWithdrawalUseCase: ProcessWithdrawalUseCase,
    private rejectWithdrawalUseCase: RejectWithdrawalUseCase,
    private withdrawalRepo: IWithdrawalRepository,
  ) {}

  async requestWithdrawal(req: Request, res: Response): Promise<void> {
    try {
      const instructorId = (req as AuthenticatedRequest).user.id;

      const result = await this.requestWithdrawalUseCase.execute({
        instructorId,
        amount: req.body.amount,
        payoutMethod: req.body.payoutMethod || 'STRIPE',
      });

      res.status(HttpStatusCode.CREATED).json({
        success: true,
        message: 'Withdrawal request submitted successfully',
        data: result,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const statusCode =
        (error as { statusCode?: number }).statusCode ||
        HttpStatusCode.INTERNAL_SERVER_ERROR;

      logger.error('Error in requestWithdrawal:', error);
      res.status(statusCode).json({
        success: false,
        message: errorMessage || 'Failed to submit withdrawal request',
      });
    }
  }

  async getMyWithdrawals(req: Request, res: Response): Promise<void> {
    const instructorId = (req as AuthenticatedRequest).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await this.withdrawalRepo.findByInstructorId(
      instructorId,
      page,
      limit,
    );

    res.status(HttpStatusCode.OK).json({
      success: true,
      data: result.data.map(WithdrawalResponseMapper.toResponseDto),
      pagination: {
        total: result.total,
        page,
        limit,
      },
    });
  }

  // Admin methods
  async getAllWithdrawals(req: Request, res: Response): Promise<void> {
    try {
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

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: result.data.map(WithdrawalResponseMapper.toResponseDto),
        pagination: {
          total: result.total,
          page,
          limit,
        },
      });
    } catch (error: unknown) {
      logger.error('Error in getAllWithdrawals:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch withdrawals',
      });
    }
  }

  async processWithdrawal(req: Request, res: Response): Promise<void> {
    try {
      const { withdrawalId } = req.params;
      const { adminNotes } = req.body;

      const result = await this.processWithdrawalUseCase.execute(
        { withdrawalId },
        adminNotes,
      );

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: 'Withdrawal processed successfully',
        data: result,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const statusCode =
        (error as { statusCode?: number }).statusCode ||
        HttpStatusCode.INTERNAL_SERVER_ERROR;

      logger.error('Error in processWithdrawal:', error);
      res.status(statusCode).json({
        success: false,
        message: errorMessage || 'Failed to process withdrawal',
      });
    }
  }

  async rejectWithdrawal(req: Request, res: Response): Promise<void> {
    try {
      const { withdrawalId } = req.params;
      const { reason } = req.body;

      const result = await this.rejectWithdrawalUseCase.execute({
        withdrawalId,
        reason,
      });

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: 'Withdrawal request rejected successfully',
        data: result,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const statusCode =
        (error as { statusCode?: number }).statusCode ||
        HttpStatusCode.INTERNAL_SERVER_ERROR;

      logger.error('Error in rejectWithdrawal:', error);
      res.status(statusCode).json({
        success: false,
        message: errorMessage || 'Failed to reject withdrawal',
      });
    }
  }
}
