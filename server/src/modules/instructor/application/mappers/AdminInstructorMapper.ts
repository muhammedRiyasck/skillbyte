import { AdminInstructorPaginationDto } from '../dtos/AdminInstructorDtos';
import { AdminInstructorFilter } from '../../../../shared/enums/AdminInstructorFilter';
import { InstructorAccountStatus } from '../../../../shared/enums/InstructorAccountStatus';

export class AdminInstructorMapper {
  static toGetInstructorsFilter(dto: AdminInstructorPaginationDto) {
    let query: Record<string, unknown> = {};
    const status = dto.status;

    if (status?.trim() === AdminInstructorFilter.PENDING) {
      query = { accountStatus: InstructorAccountStatus.PENDING };
    } else if (status?.trim() === AdminInstructorFilter.APPROVED) {
      query = { accountStatus: InstructorAccountStatus.ACTIVE, approved: true };
    } else if (status?.trim() === AdminInstructorFilter.REJECTED) {
      query = {
        accountStatus: InstructorAccountStatus.REJECTED,
        rejected: true,
      };
    } else if (status?.trim() === AdminInstructorFilter.SUSPENDED) {
      query = {
        accountStatus: InstructorAccountStatus.SUSPENDED,
        approved: true,
      };
    }

    const search = dto.search;
    if (search && search.trim()) {
      const searchFilter = {
        $or: [
          { name: { $regex: search.trim(), $options: 'i' } },
          { email: { $regex: search.trim(), $options: 'i' } },
          { expertise: { $regex: search.trim(), $options: 'i' } },
          { jobTitle: { $regex: search.trim(), $options: 'i' } },
          { subject: { $regex: search.trim(), $options: 'i' } },
        ],
      };
      query = { ...query, ...searchFilter };
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
