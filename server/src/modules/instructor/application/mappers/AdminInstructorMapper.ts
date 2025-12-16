import { AdminInstructorPaginationDto } from '../dtos/AdminInstructorDtos';

export class AdminInstructorMapper {
  static toGetInstructorsFilter(dto: AdminInstructorPaginationDto) {
    let query: Record<string, any> = {};
    const status = dto.status;
    
    if (status?.trim() === 'Pending Instructors') {
      query = { accountStatus: 'pending' };
    } else if (status?.trim() === 'Approved Instructors') {
      query = { accountStatus: 'active', approved: true };
    } else if (status?.trim() === 'Rejected Instructors') {
      query = { accountStatus: 'rejected', rejected: true };
    } else if (status?.trim() === 'Suspended Instructors') {
      query = { accountStatus: 'suspended', approved: true };
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
        ]
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
