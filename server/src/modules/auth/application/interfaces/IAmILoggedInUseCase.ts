import { UserRole } from '../../../../shared/enums/UserRole';
import { AuthResponseDto } from '../dtos/AuthResponseDto';

export interface IAmILoggedInUseCase {
  execute(id: string, role: UserRole): Promise<AuthResponseDto | null>;
}
