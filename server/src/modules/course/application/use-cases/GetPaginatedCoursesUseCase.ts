import { ICourseRepository } from '../../domain/IRepositories/ICourseRepository';
import { IEnrollmentReadRepository } from '../../../enrollment/domain/IRepositories/IEnrollmentReadRepository';
import { IGetPaginatedCoursesUseCase } from '../interfaces/IGetPaginatedCoursesUseCase';
import { CourseMapper } from '../mappers/CourseMapper';
import { GetCoursesQueryDto } from '../dtos/CourseDto';
import { PaginatedCourseResponseDto } from '../dtos/CourseResponseDto';
import { CourseStatus } from '../../../../shared/enums/CourseStatus';
import { AdminCourseFilter } from '../../../../shared/enums/AdminCourseFilter';
import { UserRole } from '../../../../shared/enums/UserRole';
import { IEnrollment } from '../../../enrollment/domain/entities/Enrollment';

/** Executes the business logic for get paginated courses. */
export class GetPaginatedCoursesUseCase implements IGetPaginatedCoursesUseCase {
  constructor(
    private _courseRepo: ICourseRepository,
    private _enrollmentRepo?: IEnrollmentReadRepository,
  ) {}

  /**
   * Execute for the GetPaginatedCourses entity.
   *
   * @param dto - The data transfer object containing request details.
   * @returns The standardized HTTP response.
   */
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
      isBlocked,
      userId,
      userRole,
    } = dto;

    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safeLimit =
      Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 6;

    // Build the query object (MongoDB-style filtering stays in use case, not controller)
    const query: Record<string, unknown> = {};

    if (instructorId) query.instructorId = instructorId;

    if (isBlocked !== undefined) {
      query.isBlocked = isBlocked;
    }

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
    let courseDtos = data.map((c) => CourseMapper.toResponseDto(c));

    if (
      userId &&
      userRole === UserRole.STUDENT &&
      this._enrollmentRepo &&
      courseDtos.length > 0
    ) {
      const courseIds = courseDtos
        .map((c) => c.id)
        .filter((id): id is string => !!id);
      const enrollments = await this._enrollmentRepo.findEnrollmentsForUser(
        userId,
        courseIds,
      );
      const enrolledSet = new Set(
        enrollments.map((e: IEnrollment) => e.courseId.toString()),
      );

      courseDtos = courseDtos.map((c) => ({
        ...c,
        isEnrolled: enrolledSet.has(c.id || ''),
      }));
    }

    return {
      data: courseDtos,
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
