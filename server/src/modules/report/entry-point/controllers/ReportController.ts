import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../../../shared/types/AuthenticatedRequestType';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import { z } from 'zod';
import { ISubmitReportUseCase } from '../../application/interfaces/ISubmitReportUseCase';
import { IGetPendingReportsUseCase } from '../../application/interfaces/IGetPendingReportsUseCase';
import { IDismissReportUseCase } from '../../application/interfaces/IDismissReportUseCase';
import { IActionReportUseCase } from '../../application/interfaces/IActionReportUseCase';

const SubmitReportSchema = z.object({
  targetType: z.enum(['review', 'course', 'lesson']),
  targetId: z.string().min(1),
  reason: z.string().min(3).max(100),
  description: z.string().max(1000).optional(),
});

export class ReportController {
  constructor(
    private submitReportUseCase: ISubmitReportUseCase,
    private getPendingReportsUseCase: IGetPendingReportsUseCase,
    private dismissReportUseCase: IDismissReportUseCase,
    private actionReportUseCase: IActionReportUseCase,
  ) {}

  submitReport = async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const studentId = authReq.user.id;
    const { targetType, targetId, reason, description } =
      SubmitReportSchema.parse(req.body);

    const report = await this.submitReportUseCase.execute(
      studentId,
      targetType,
      targetId,
      reason,
      description,
    );

    ApiResponseHelper.created(res, 'Report submitted successfully', { report });
  };

  getPendingReports = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const data = await this.getPendingReportsUseCase.execute(page, limit);

    ApiResponseHelper.success(
      res,
      'Pending reports retrieved successfully',
      data,
    );
  };

  dismissReport = async (req: Request, res: Response) => {
    const { reportId } = req.params;
    await this.dismissReportUseCase.execute(reportId);
    ApiResponseHelper.success(res, 'Report dismissed successfully');
  };

  actionReport = async (req: Request, res: Response) => {
    const { reportId } = req.params;
    await this.actionReportUseCase.execute(reportId);
    ApiResponseHelper.success(res, 'Action applied successfully');
  };
}
