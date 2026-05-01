export interface IGetMySessionRatingsUseCase {
  execute(studentId: string): Promise<
    Record<
      string,
      {
        rating: number;
        comment: string;
        instructorReply?: string;
        repliedAt?: Date;
      }
    >
  >;
}
