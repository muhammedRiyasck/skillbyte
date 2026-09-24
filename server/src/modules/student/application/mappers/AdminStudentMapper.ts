import { AdminStudentPaginationRequestDto } from '../dtos/AdminStudentRequestDto';

/** Handles admin student mapper functionality. */
export class AdminStudentMapper {
  /**
   * To list all filter for the AdminStudentMapper entity.
   *
   * @param dto - The data transfer object containing request details.
   */
  static toListAllFilter(dto: AdminStudentPaginationRequestDto) {
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

  /**
   * To sort for the AdminStudentMapper entity.
   *
   * @param sortParam - The sort param information.
   * @returns The result of the operation.
   */
  static toSort(sortParam: string | undefined): Record<string, 1 | -1> {
    let sort: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortParam) {
      const [field, dir] = sortParam.split(':');
      sort = { [field]: dir === 'asc' ? 1 : -1 };
    }
    return sort;
  }
}
