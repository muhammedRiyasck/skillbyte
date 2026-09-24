import { ICourseRepository } from '../../domain/IRepositories/ICourseRepository';
import { IBlockCourseUseCase } from '../interfaces/IBlockCourseUseCase';

/** Executes the business logic for block course. */
export class BlockCourseUseCase implements IBlockCourseUseCase {
  constructor(private _courseRepository: ICourseRepository) {}

  /**
   * Execute for the BlockCourse entity.
   *
   * @param courseId - The unique identifier for the course.
   * @param isBlocked - The is blocked information.
   */
  async execute(courseId: string, isBlocked: boolean): Promise<void> {
    await this._courseRepository.blockCourse(courseId, isBlocked);
  }
}
