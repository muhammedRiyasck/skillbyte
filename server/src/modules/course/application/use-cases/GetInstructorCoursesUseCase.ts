import { ICourseRepository } from "../../domain/IRepositories/ICourseRepository";

export class GetInstructorCoursesUseCase {
  constructor(private courseRepo: ICourseRepository) {}

  async execute(query:{instructorId:string,status?:string},page:number,limit:number,sort:Record<string, 1 | -1>) {
    const safePage  = Number.isFinite(page)  && page  > 0 ? page  : 1;
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 6;
    const { data, total } = await this.courseRepo.listPaginated(query,page,limit,sort);
    const totalPages = Math.ceil(total / safeLimit);
      return {
      data,
      meta: {
        page: safePage,
        limit: safeLimit,
        totalItems: total,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPrevPage: safePage > 1
      }
    };
  }
}
