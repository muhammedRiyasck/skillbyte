import { IReportActionStrategy } from './IReportActionStrategy';

export class ReportActionStrategyRegistry {
  private strategies = new Map<string, IReportActionStrategy>();

  register(strategy: IReportActionStrategy): void {
    this.strategies.set(strategy.targetType, strategy);
  }

  get(targetType: string): IReportActionStrategy | undefined {
    return this.strategies.get(targetType);
  }
}
