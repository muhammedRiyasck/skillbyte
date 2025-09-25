import type{Ibase} from './IBase'
export interface IPaginatedCourses {
  data: Ibase[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
