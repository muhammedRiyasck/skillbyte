import { ICourseRepository } from '../../domain/IRepositories/ICourseRepository';
import { IGetCategories } from '../interfaces/IGetCategories';

/** Handles get categories functionality. */
export class GetCategories implements IGetCategories {
  constructor(private courseRepository: ICourseRepository) {}

  /**
   * Execute for the GetCategories entity.
   *
   * @returns The result of the operation.
   */
  async execute(): Promise<string[]> {
    const categories = await this.courseRepository.getCategories();
    return categories || [];
  }
}
