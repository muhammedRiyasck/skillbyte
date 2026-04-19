export interface IGetCourseRatingSummaryUseCase {
  execute(
    targetType: string,
    targetId: string,
  ): Promise<{
    average: number;
    count: number;
    distribution: Record<number, number>;
  }>;
}
