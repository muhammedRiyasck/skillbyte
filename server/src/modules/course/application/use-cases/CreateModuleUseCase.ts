import mongoose from 'mongoose';
import { Module } from '../../domain/entities/Module';
import { IModuleRepository } from '../../domain/IRepositories/IModuleRepository';
import { ICourseRepository } from '../../domain/IRepositories/ICourseRepository';
import { ICreateModuleUseCase } from '../interfaces/ICreateModuleUseCase';
import { CreateModuleDto, ModuleResponseDto } from '../dtos/ModuleDtos';
import { eventBus } from '../../../../shared/services/event-bus/EventBus';
import { COURSE_EVENTS } from '../../../../shared/services/event-bus/CourseEvents';
import { ModuleMapper } from '../mappers/ModuleMapper';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

/** Executes the business logic for create module. */
export class CreateModuleUseCase implements ICreateModuleUseCase {
  /**
   * Constructs a new CreateModuleUseCase instance.
   * @param _moduleRepo - The repository for module data operations.
   * @param _courseRepo - The repository for course data operations.
   */
  constructor(
    private _moduleRepo: IModuleRepository,
    private _courseRepo: ICourseRepository,
  ) {}

  /**
   * Execute for the CreateModule entity.
   *
   * @param dto - The data transfer object containing request details.
   * @returns The standardized HTTP response.
   */
  async execute(dto: CreateModuleDto): Promise<ModuleResponseDto | null> {
    const courseId = (dto.courseId || dto.id) as string;

    // Ownership check: ensure the instructor owns the course before creating a module
    if (this._courseRepo && dto.instructorId) {
      const course = await this._courseRepo.findById(courseId);
      if (!course || course.instructorId !== dto.instructorId) {
        throw new HttpError(
          'You do not own this course.',
          HttpStatusCode.FORBIDDEN,
        );
      }
    }

    const isObjectId =
      mongoose.Types.ObjectId.isValid(dto.moduleId) &&
      String(new mongoose.Types.ObjectId(dto.moduleId)) === dto.moduleId;

    let savedModule: Module | null = null;

    // If moduleId is not a valid ObjectId, create a new module
    if (!isObjectId) {
      savedModule = await this._moduleRepo.save({
        courseId: courseId,
        title: dto.title!,
        description: dto.description || '',
        order: dto.order!,
      });
    } else {
      // If moduleId is valid, check if the module already exists
      const isModuleExist = await this._moduleRepo.findById(dto.moduleId);

      if (!isModuleExist) {
        savedModule = await this._moduleRepo.save({
          courseId: courseId,
          title: dto.title!,
          description: dto.description || '',
          order: dto.order!,
        });
      }
    }

    // Emit event if a new module was created
    if (savedModule && this._courseRepo) {
      const course = await this._courseRepo.findById(courseId);
      if (course) {
        eventBus.emit(COURSE_EVENTS.MODULE_CREATED, {
          courseId: courseId,
          courseTitle: course.title,
          moduleTitle: dto.title!,
          instructorId: course.instructorId,
        });
      }
    }

    return savedModule ? ModuleMapper.toResponse(savedModule) : null;
  }
}
