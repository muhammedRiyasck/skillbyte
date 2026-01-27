import { Lesson } from '../../domain/entities/Lesson';
import { ILessonRepository } from '../../domain/IRepositories/ILessonRepository';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { IBlockLessonUseCase } from '../interfaces/IBlockLessonUseCase';

export class BlockLessonUseCase implements IBlockLessonUseCase {
  constructor(private _lessonRepository: ILessonRepository) {}

  async execute(lessonId: string, isBlocked: boolean): Promise<Lesson> {
    const lesson = await this._lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new HttpError('Lesson not found', HttpStatusCode.NOT_FOUND);
    }

    lesson.isBlocked = isBlocked;
    await this._lessonRepository.updateLessonById(lessonId, lesson);

    return lesson;
  }
}
