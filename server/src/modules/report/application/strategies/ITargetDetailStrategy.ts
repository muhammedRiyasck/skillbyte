export interface TargetDetails {
  title?: string;
  comment?: string;
  rating?: number;
}

export interface ITargetDetailStrategy {
  readonly targetType: string;
  fetchDetails(targetId: string): Promise<TargetDetails | null>;
}
