import { InstructorAccountStatus } from '../../../../shared/enums/InstructorAccountStatus';

export interface AdminInstructorPaginationRequestDto {
  page?: number;
  limit?: number;
  sort?: string;
  status?: string;
  search?: string;
}

export interface ApproveInstructorRequestDto {
  id: string;
}

export interface DeclineInstructorRequestDto {
  id: string;
  reason: string;
}

export interface ChangeInstructorStatusRequestDto {
  status: InstructorAccountStatus.ACTIVE | InstructorAccountStatus.SUSPENDED;
  reason?: string;
}
