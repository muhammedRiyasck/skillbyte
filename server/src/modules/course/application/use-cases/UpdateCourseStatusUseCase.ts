
import { ICourseRepository } from "../../domain/IRepositories/ICourseRepository";
import { IUpdateCourseStatusUseCase } from "../interfaces/IUpdateCourseStatusUseCase";
import { ERROR_MESSAGES } from "../../../../shared/constants/messages";
import { HttpError } from "../../../../shared/types/HttpError";
import { HttpStatusCode } from "../../../../shared/enums/HttpStatusCodes";

export class UpdateCourseStatusUseCase implements IUpdateCourseStatusUseCase{
  constructor(private courseRepo: ICourseRepository) {}

  async execute(courseId: string, instructorId: string, status: "list" | "unlist"): Promise<void> {
    const course = await this.courseRepo.findById(courseId);
    if (!course) throw new HttpError(ERROR_MESSAGES.COURSE_NOT_FOUND, HttpStatusCode.NOT_FOUND);

    if (course.instructorId !== instructorId) {
      throw new HttpError(ERROR_MESSAGES.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
    }

    await this.courseRepo.updateStatus(courseId, status);
  }
}
