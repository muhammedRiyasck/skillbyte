import { AdminStudentPaginationDto, ChangeStudentStatusDto } from '../dtos/AdminStudentDtos';

export class AdminStudentMapper {
    static toListAllFilter(dto: AdminStudentPaginationDto) {
        let filter: Record<string, any> = {};
        const search = dto.search;
        if (search && search.trim()) {
          filter = {
            $or: [
              { name: { $regex: search.trim(), $options: 'i' } },
              { email: { $regex: search.trim(), $options: 'i' } },
              { registeredVia: { $regex: search.trim(), $options: 'i' } },
              { accountStatus: { $regex: search.trim(), $options: 'i' } },
            ]
          };
        }
        return filter;
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
