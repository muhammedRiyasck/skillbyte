import { AdminStudentPaginationDto } from '../dtos/AdminStudentDtos';

export class AdminStudentMapper {
  static toListAllFilter(dto: AdminStudentPaginationDto) {
    let query: Record<string, unknown> = {};
    const search = dto.search;
    if (search && search.trim()) {
      query = {
        $or: [
          { name: { $regex: search.trim(), $options: 'i' } },
          { email: { $regex: search.trim(), $options: 'i' } },
          { registeredVia: { $regex: search.trim(), $options: 'i' } },
          { accountStatus: { $regex: search.trim(), $options: 'i' } },
        ],
      };
    }
    return query;
  }

  static toSort(sortParam: string | undefined): Record<string, 1 | -1> {
    let sort: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortParam) {
      const [field, dir] = sortParam.split(':');
      sort = { [field]: dir === 'asc' ? 1 : -1 };
    }
    return sort;
  }
}
