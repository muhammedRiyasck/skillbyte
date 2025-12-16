export interface IRegisterStudentUseCase {
  isUserExists(email: string): Promise<boolean>;
  execute(email: string, otp: string): Promise<void>;
}
