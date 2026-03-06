import { UserRole } from '../../../../shared/enums/UserRole';

export interface IForgotPasswordUseCase {
  execute(email: string, role: UserRole): Promise<false | void>;
}
