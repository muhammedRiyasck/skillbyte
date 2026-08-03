import { IStudentRepository } from '../../domain/IRepositories/IStudentRepository';
import { IChangeStudentStatusUseCase } from '../interfaces/IChangeStudentStatusUseCase';
import { UserAccountStatus } from '../../../../shared/enums/UserAccountStatus';
import { SocketService } from '../../../../shared/services/socket/SocketService';

/**
 * Use case for changing a student's account status.
 * Handles activation or blocking of student accounts.
 */
export class ChangeStudentStatusUseCase implements IChangeStudentStatusUseCase {
  /**
   * Constructs the ChangeStudentStatusUseCase.
   * @param repo - The student repository for data operations.
   */
  constructor(private _studentRepo: IStudentRepository) {}

  /**
   * Executes the status change for a student.
   * Updates the student's account status to active or blocked.
   * If blocked, notifies the student in real-time via socket.
   * @param id - The ID of the student.
   * @param status - The new status ('active' or 'blocked').
   * @throws Error if the status change fails.
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
