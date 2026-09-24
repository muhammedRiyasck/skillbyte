import { IReportActionStrategy } from './IReportActionStrategy';

/** Handles report action strategy registry functionality. */
export class ReportActionStrategyRegistry {
  private strategies = new Map<string, IReportActionStrategy>();

  /**
   * Register for the ReportActionStrategyRegistry entity.
   *
   * @param strategy - The strategy information.
   */
  register(strategy: IReportActionStrategy): void {
    this.strategies.set(strategy.targetType, strategy);
  }

  /**
   * Get for the ReportActionStrategyRegistry entity.
   *
   * @param targetType - The target type information.
   * @returns The result of the operation.
   */
  get(targetType: string): IReportActionStrategy | undefined {
    return this.strategies.get(targetType);
  }
}
