export interface IGetMySessionRatingsUseCase {
  execute(studentId: string): Promise<Record<string, number>>;
}
