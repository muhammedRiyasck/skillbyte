import { UserAccountStatus } from '../../../../shared/enums/UserAccountStatus';

export interface IChangeStudentStatusUseCase {
  execute(id: string, status: UserAccountStatus): Promise<void>;
}
