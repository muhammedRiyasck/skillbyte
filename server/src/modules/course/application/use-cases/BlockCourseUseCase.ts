import { ICourseRepository } from "../../domain/IRepositories/ICourseRepository";
import { IBlockCourseUseCase } from "../interfaces/IBlockCourseUseCase";

export class BlockCourseUseCase implements IBlockCourseUseCase {
  constructor(private _courseRepository: ICourseRepository) {}

  async execute(courseId: string, isBlocked: boolean): Promise<void> {
    await this._courseRepository.blockCourse(courseId, isBlocked);
  }
}
