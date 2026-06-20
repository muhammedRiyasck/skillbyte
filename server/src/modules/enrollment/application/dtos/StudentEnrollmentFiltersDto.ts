import { EnrollmentStatus } from '../../../../shared/enums/EnrollmentStatus';

export interface StudentEnrollmentFiltersDto {
  search?: string;
  status?: EnrollmentStatus;
}
