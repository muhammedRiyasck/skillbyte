
import { ICourseRepository } from "../../domain/IRepositories/ICourseRepository";
import { IGetCategories } from "../interfaces/IGetCategories";

export class GetCategories implements IGetCategories {
  constructor(private courseRepository: ICourseRepository) {}

  async execute(): Promise<string[]> {
    const categories = await this.courseRepository.getCategories();
    return categories || [];
  }
}
