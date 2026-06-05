import { IAdminRepository } from '../../../admin/domain/IRepositories/IAdminRepository';
import { IInstructorRepository } from '../../../instructor/domain/IRepositories/IInstructorRepository';
import { IStudentRepository } from '../../../student/domain/IRepositories/IStudentRepository';
import { IAmILoggedInUseCase } from '../interfaces/IAmILoggedInUseCase';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { UserRole } from '../../../../shared/enums/UserRole';
import { AuthResponseDto } from '../dtos/AuthResponseDto';
import { AuthMapper } from '../mappers/AuthMapper';

/**
 * Use case for checking if a user is logged in by retrieving their data based on ID and role.
 * This class handles the logic to fetch user information from the appropriate repository.
 */
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
   * Executes the use case to retrieve user data.
   * @param id - The unique identifier of the user.
   * @param role - The role of the user ('student' or 'instructor').
   * @returns A promise that resolves to the user data (Student or Instructor) or null if not found.
   * @throws {HttpError} If the ID or role is missing or invalid.
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
