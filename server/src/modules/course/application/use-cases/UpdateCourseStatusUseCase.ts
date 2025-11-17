
import { ICourseRepository } from "../../domain/IRepositories/ICourseRepository";
import { IModuleRepository } from "../../domain/IRepositories/IModuleRepository";
import { IUpdateCourseStatusUseCase } from "../interfaces/IUpdateCourseStatusUseCase";
import { ERROR_MESSAGES } from "../../../../shared/constants/messages";
import { HttpError } from "../../../../shared/types/HttpError";
import { HttpStatusCode } from "../../../../shared/enums/HttpStatusCodes";
import { ILessonRepository } from "../../domain/IRepositories/ILessonRepository";

export class UpdateCourseStatusUseCase implements IUpdateCourseStatusUseCase{
  constructor(private courseRepo: ICourseRepository ,private moduleRepo :IModuleRepository,private lesson:ILessonRepository) {}

  async execute(courseId: string, instructorId: string, status: "list" | "unlist"): Promise<void> {
    const course = await this.courseRepo.findById(courseId);
    if (!course) throw new HttpError(ERROR_MESSAGES.COURSE_NOT_FOUND, HttpStatusCode.NOT_FOUND);
    const modules = await this.moduleRepo.findModulesByCourseId(courseId);
    console.log("modules",modules);
    if(!modules[0] || !modules[0].moduleId){
      throw new HttpError('A module should be there To list this course', HttpStatusCode.BAD_REQUEST);
    }

    const moduleIds = modules.map((m) => m.moduleId!.toString());
    const lessons = await this.lesson.findByModuleId(moduleIds);
    if(!lessons[0] || !lessons[0].lessonId){
      throw new HttpError('A lessons should be there To list this course ', HttpStatusCode.BAD_REQUEST);
    }
    if (course.instructorId !== instructorId) {
      throw new HttpError(ERROR_MESSAGES.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
    }

    await this.courseRepo.updateStatus(courseId, status);
  }
}
