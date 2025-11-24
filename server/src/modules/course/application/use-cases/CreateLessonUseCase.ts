import { HttpStatusCode } from "../../../../shared/enums/HttpStatusCodes";
import { ICourseRepository } from "../../domain/IRepositories/ICourseRepository";
import { ILessonRepository } from "../../domain/IRepositories/ILessonRepository";
import { IModuleRepository } from "../../domain/IRepositories/IModuleRepository";
import { Lesson } from "../../domain/entities/Lesson";
import { ICreateLessonUseCase } from "../interfaces/ICreateLessonUseCase";
import { ERROR_MESSAGES } from "../../../../shared/constants/messages";
import { HttpError } from "../../../../shared/types/HttpError";

type WithInstructorId<T> = T & { instructorId: string };

/**
 * Use case for creating a new lesson.
 * Handles validation of module and course ownership, then creates and saves the lesson.
 */
export class CreateLessonUseCase implements ICreateLessonUseCase {
  /**
   * Constructs a new CreateLessonUseCase instance.
   * @param courseRepo - The repository for course data operations.
   * @param moduleRepo - The repository for module data operations.
   * @param lessonRepo - The repository for lesson data operations.
   */
  constructor(
    private _courseRepo: ICourseRepository,
    private _moduleRepo: IModuleRepository,
    private _lessonRepo: ILessonRepository,
  ) {}

  /**
   * Executes the lesson creation logic.
   * Validates the module exists, the course exists, and the instructor owns the course.
   * Creates a new Lesson entity and saves it.
   * @param dto - The data transfer object containing lesson creation details with instructor ID.
   * @returns A promise that resolves to the created Lesson entity.
   * @throws HttpError with appropriate status code if validation fails.
   */
  async execute(dto: WithInstructorId<Lesson>): Promise<Lesson> {
    const module = await this._moduleRepo.findById(dto.moduleId);
    if (!module) {
      throw new HttpError(ERROR_MESSAGES.MODULE_NOT_FOUND, HttpStatusCode.BAD_REQUEST);
    }

    const course = await this._courseRepo.findById(module.courseId);
    if (!course) {
      throw new HttpError(ERROR_MESSAGES.COURSE_NOT_FOUND, HttpStatusCode.BAD_REQUEST);
    }

    if (course.instructorId !== dto.instructorId) {
      throw new HttpError(ERROR_MESSAGES.UNAUTHORIZED_ADD_LESSON, HttpStatusCode.BAD_REQUEST);
    }

    const lesson = new Lesson(
      dto.moduleId,
      dto.title,
      dto.description,
      dto.contentType,
      dto.fileName,
      dto.order,
      dto.duration,
      dto.resources,
      dto.isFreePreview || false,
      dto.isPublished || false,
    );

    return await this._lessonRepo.create(lesson);
  }
}
