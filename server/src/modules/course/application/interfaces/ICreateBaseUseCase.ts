import { Course } from "../../domain/entities/Course";
import { CreateCourseDTO } from "../dtos/CreateBaseDTO";

export interface ICreateBaseUseCase {
  execute(dto: CreateCourseDTO): Promise<Course>
}
