export interface IRegisterInstructorUseCase {
  isUserExists(email: string): Promise<boolean>;
  execute(email: string, otp: string, resumeKey?: string): Promise<void>;
}
