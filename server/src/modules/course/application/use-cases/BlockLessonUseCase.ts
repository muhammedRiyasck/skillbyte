import { ILessonRepository } from '../../domain/IRepositories/ILessonRepository';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { IBlockLessonUseCase } from '../interfaces/IBlockLessonUseCase';
import { LessonResponseDto } from '../dtos/LessonDtos';
import { LessonMapper } from '../mappers/LessonMapper';

export class BlockLessonUseCase implements IBlockLessonUseCase {
  constructor(private _lessonRepository: ILessonRepository) {}

  async execute(
    lessonId: string,
    isBlocked: boolean,
  ): Promise<LessonResponseDto> {
    const lesson = await this._lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new HttpError('Lesson not found', HttpStatusCode.NOT_FOUND);
    }

    lesson.isBlocked = isBlocked;
    await this._lessonRepository.updateLessonById(lessonId, lesson);

    return LessonMapper.toResponse(lesson);
  }
}
