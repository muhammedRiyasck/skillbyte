import { IStudentRepository } from '../../domain/IRepositories/IStudentRepository';
import { IGetStudentProfileUseCase } from '../interfaces/IGetStudentProfileUseCase';
import { StudentResponseDto } from '../dtos/StudentResponseDto';
import { StudentMapper } from '../mappers/StudentMapper';

/**
 * Use case for retrieving a student's own profile.
 */
export class GetStudentProfileUseCase implements IGetStudentProfileUseCase {
  constructor(private readonly _studentRepo: IStudentRepository) {}

  async execute(id: string): Promise<StudentResponseDto | null> {
    const student = await this._studentRepo.findById(id);
    return student ? StudentMapper.toResponseDto(student) : null;
  }
}
