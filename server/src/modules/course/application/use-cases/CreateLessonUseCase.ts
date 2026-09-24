import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { ICourseRepository } from '../../domain/IRepositories/ICourseRepository';
import { ILessonRepository } from '../../domain/IRepositories/ILessonRepository';
import { IModuleRepository } from '../../domain/IRepositories/IModuleRepository';
import { Lesson } from '../../domain/entities/Lesson';
import { ICreateLessonUseCase } from '../interfaces/ICreateLessonUseCase';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { HttpError } from '../../../../shared/types/HttpError';
import { eventBus } from '../../../../shared/services/event-bus/EventBus';
import { COURSE_EVENTS } from '../../../../shared/services/event-bus/CourseEvents';
import { LessonMapper } from '../mappers/LessonMapper';
import { CreateLessonDto, LessonResponseDto } from '../dtos/LessonDtos';

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
   * Maps the raw DTO to a domain entity, validates module/course ownership, and saves.
   * @param dto - Raw lesson creation DTO from the controller.
   * @param instructorId - The authenticated instructor's ID.
   * @returns A promise that resolves to the created LessonResponseDto.
   * @throws HttpError with appropriate status code if validation fails.
   */
  async execute(dto: CreateLessonDto, instructorId: string): Promise<LessonResponseDto> {
    const lessonEntity = LessonMapper.toCreateEntity(dto, instructorId);

    const module = await this._moduleRepo.findById(lessonEntity.moduleId);
    if (!module) {
      throw new HttpError(
        ERROR_MESSAGES.MODULE_NOT_FOUND,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const course = await this._courseRepo.findById(module.courseId);
    if (!course) {
      throw new HttpError(
        ERROR_MESSAGES.COURSE_NOT_FOUND,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    if (course.instructorId !== instructorId) {
      throw new HttpError(
        ERROR_MESSAGES.UNAUTHORIZED_ADD_LESSON,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const lesson = new Lesson(
      lessonEntity.moduleId,
      lessonEntity.title,
      lessonEntity.description,
      lessonEntity.contentType,
      lessonEntity.fileName,
      lessonEntity.order,
      lessonEntity.duration,
      lessonEntity.resources,
      lessonEntity.isFreePreview || false,
      lessonEntity.isPublished || false,
      lessonEntity.isBlocked || false,
      lessonEntity.contentType === 'video' ? true : false,
    );

    const savedLesson = await this._lessonRepo.create(lesson);

    // Emit event so listeners (e.g. notifications, video transcoding queue) can react
    eventBus.emit(COURSE_EVENTS.LESSON_CREATED, {
      courseId: course.courseId!,
      courseTitle: course.title,
      lessonId: savedLesson.lessonId,
      lessonTitle: lessonEntity.title,
      instructorId,
      contentType: savedLesson.contentType,
      fileName: savedLesson.fileName,
    });

    return LessonMapper.toResponse(savedLesson);
  }
}
