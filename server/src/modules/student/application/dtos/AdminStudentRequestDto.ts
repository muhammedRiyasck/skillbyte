import { UserAccountStatus } from '../../../../shared/enums/UserAccountStatus';

export interface AdminStudentPaginationRequestDto {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
}

export interface ChangeStudentStatusRequestDto {
  id: string;
  status: UserAccountStatus.ACTIVE | UserAccountStatus.BLOCKED;
}
