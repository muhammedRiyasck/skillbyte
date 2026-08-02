import { ICourseRepository } from '../../domain/IRepositories/ICourseRepository';
import { IGetPaginatedCoursesUseCase } from '../interfaces/IGetPaginatedCoursesUseCase';
import { CourseMapper } from '../mappers/CourseMapper';
import { GetCoursesQueryDto } from '../dtos/CourseDto';
import { PaginatedCourseResponseDto } from '../dtos/CourseResponseDto';
import { CourseStatus } from '../../../../shared/enums/CourseStatus';
import { AdminCourseFilter } from '../../../../shared/enums/AdminCourseFilter';

/**
 * Use case for retrieving paginated courses with optional filters and sorting.
 * The query-building (filter/sort logic) now lives here instead of in the controller.
 */
export class GetPaginatedCoursesUseCase implements IGetPaginatedCoursesUseCase {
  constructor(private _courseRepo: ICourseRepository) {}

  async execute(
    dto: GetCoursesQueryDto,
  ): Promise<PaginatedCourseResponseDto | null> {
    const {
      page = 1,
      limit = 6,
      sort: sortParam,
      status,
      instructorId,
      category,
      search,
      level,
      language,
      minPrice,
      maxPrice,
    } = dto;

    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safeLimit =
      Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 6;

    // Build the query object (MongoDB-style filtering stays in use case, not controller)
    const query: Record<string, unknown> = {};

    if (instructorId) query.instructorId = instructorId;

    // Resolve status filter
    if (status) {
      if (status === AdminCourseFilter.DRAFTED) {
        query.status = CourseStatus.DRAFT;
      } else if (
        status === AdminCourseFilter.LISTED ||
        status === CourseStatus.LIST
      ) {
        query.status = CourseStatus.LIST;
      } else if (
        status === AdminCourseFilter.UNLISTED ||
        status === CourseStatus.UNLIST
      ) {
        query.status = CourseStatus.UNLIST;
      } else if (status === AdminCourseFilter.BLOCKED) {
        query.isBlocked = true;
      } else {
        query.status = status;
      }
    }

    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }
    if (level) {
      query.courseLevel = { $regex: level, $options: 'i' };
    }
    if (language) {
      query.language = { $regex: language, $options: 'i' };
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceQuery: Record<string, number> = {};
      if (minPrice !== undefined) priceQuery.$gte = minPrice;
      if (maxPrice !== undefined) priceQuery.$lte = maxPrice;
      query.price = priceQuery;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort
    let sort: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortParam) {
      const [field, dir] = sortParam.split(':');
      sort = { [field]: dir === 'asc' ? 1 : -1 };
    }

    const { data, total } = await this._courseRepo.paginatedList(
      query,
      safePage,
      safeLimit,
      sort,
    );

    const totalPages = Math.ceil(total / safeLimit);

    return {
      data: data.map((c) => CourseMapper.toResponseDto(c)),
      meta: {
        page: safePage,
        limit: safeLimit,
        totalItems: total,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPrevPage: safePage > 1,
      },
    };
  }
}
