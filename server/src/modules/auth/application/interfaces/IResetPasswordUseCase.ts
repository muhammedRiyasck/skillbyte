import { UserRole } from '../../../../shared/enums/UserRole';

export interface IResetPasswordUseCase {
  execute(token: string, password: string, role: UserRole): Promise<void>;
}
