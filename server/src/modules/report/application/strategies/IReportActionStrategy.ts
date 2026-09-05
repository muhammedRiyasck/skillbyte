export interface IReportActionStrategy {
  readonly targetType: string;
  executeAction(targetId: string): Promise<void>;
}
