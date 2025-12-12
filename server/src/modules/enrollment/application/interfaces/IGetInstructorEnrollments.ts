export interface IGetInstructorEnrollmentsUseCase {
  execute(instructorId: string): Promise<any[]>;
}
