export interface InstructorEnrollmentFiltersDto {
  search?: string;
  id?: string;
  status?: string;
  sort?: 'newest' | 'oldest';
}
