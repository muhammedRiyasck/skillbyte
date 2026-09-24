import { IStudentRepository } from '../../domain/IRepositories/IStudentRepository';
import { IChangeStudentStatusUseCase } from '../interfaces/IChangeStudentStatusUseCase';
import { UserAccountStatus } from '../../../../shared/enums/UserAccountStatus';
import { SocketService } from '../../../../shared/services/socket/SocketService';

/** Executes the business logic for change student status. */
export class ChangeStudentStatusUseCase implements IChangeStudentStatusUseCase {
  /**
   * Constructs the ChangeStudentStatusUseCase.
   * @param repo - The student repository for data operations.
   */
  constructor(private _studentRepo: IStudentRepository) {}

  /**
   * Execute for the ChangeStudentStatus entity.
   *
   * @param id - The unique identifier for the id.
   * @param status - The status information.
   */
  async execute(id: string, status: UserAccountStatus): Promise<void> {
    await this._studentRepo.changeStatus(id, status);

    if (status === UserAccountStatus.BLOCKED) {
      SocketService.getInstance().emitToUser(id, 'account:blocked', {
        message: 'Your account has been blocked by the administrator.',
      });
    }
  }
}
