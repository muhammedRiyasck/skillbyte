import { Course } from "../../domain/entities/Course";

export interface ICreateBaseUseCase {
  execute(dto: any): Promise<Course>
}
