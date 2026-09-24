import { IAdminRepository } from '../../../admin/domain/IRepositories/IAdminRepository';
import { IInstructorRepository } from '../../../instructor/domain/IRepositories/IInstructorRepository';
import { IStudentRepository } from '../../../student/domain/IRepositories/IStudentRepository';
import { IAmILoggedInUseCase } from '../interfaces/IAmILoggedInUseCase';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { UserRole } from '../../../../shared/enums/UserRole';
import { AuthResponseDto } from '../dtos/AuthResponseDto';
import { AuthMapper } from '../mappers/AuthMapper';

/** Executes the business logic for am i logged in. */
export class AmILoggedInUseCase implements IAmILoggedInUseCase {
  /**
   * Creates an instance of AmILoggedInUseCase.
   * @param studentRepo - The repository for student data.
   * @param instructorRepo - The repository for instructor data.
   */
  constructor(
    private _studentRepo: IStudentRepository,
    private _instructorRepo: IInstructorRepository,
    private _adminRepo: IAdminRepository,
  ) {}

  /**
   * Execute for the AmILoggedIn entity.
   *
   * @param id - The unique identifier for the id.
   * @param role - The role information.
   * @returns The standardized HTTP response.
   */
  async execute(id: string, role: UserRole): Promise<AuthResponseDto | null> {
    if (!id || !role) {
      throw new HttpError(
        'ID and role are required',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    if (
      role !== UserRole.STUDENT &&
      role !== UserRole.INSTRUCTOR &&
      role !== UserRole.ADMIN
    ) {
      throw new HttpError('Invalid role provided', HttpStatusCode.BAD_REQUEST);
    }

    let userRepo;
    switch (role) {
      case UserRole.STUDENT:
        userRepo = this._studentRepo;
        break;
      case UserRole.INSTRUCTOR:
        userRepo = this._instructorRepo;
        break;
      case UserRole.ADMIN:
        userRepo = this._adminRepo;
        break;
      default:
        throw new HttpError('Unsupported role', HttpStatusCode.BAD_REQUEST);
    }
    const user = await userRepo.findById(id);
    return user ? AuthMapper.toAuthResponseDto(user, role, id) : null;
  }
}
