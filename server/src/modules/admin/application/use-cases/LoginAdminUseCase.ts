import { IAdminRepository } from '../../domain/IRepositories/IAdminRepository';
import LoginAdminDTO from '../dtos/LoginAdminDTO ';
import { Admin } from '../../domain/entities/Admin';
import bcrypt from 'bcryptjs';
import { generateAccessToken } from '../../../../shared/utils/AccessToken';
import { generateRefreshToken } from '../../../../shared/utils/RefreshToken';
import { ILoginAdminUseCase } from '../interfaces/ILoginAdminUseCase';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

/**
 * Use case for handling admin login.
 */
export class LoginAdminUseCase implements ILoginAdminUseCase {
  /**
   * Constructs the LoginAdminUseCase with the required repository.
   * @param adminRepo - The admin repository interface.
   */
  constructor(private _adminRepo: IAdminRepository) {}

  /**
   * Executes the admin login logic.
   * @param dto - The login data transfer object containing email and password.
   * @returns A promise resolving to the admin entity, access token, and refresh token.
   * @throws Error if credentials are invalid or account is blocked.
   */
  async execute(
    dto: LoginAdminDTO,
  ): Promise<{ admin: Admin; accessToken: string; refreshToken: string }> {
    const admin = await this._adminRepo.findByEmail(dto.email);
    if (!admin) {
      throw new HttpError(
        ERROR_MESSAGES.INVALID_CREDENTIALS,
        HttpStatusCode.UNAUTHORIZED,
      );
    }
    const isMatch = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!isMatch) {
      throw new HttpError(
        ERROR_MESSAGES.INVALID_CREDENTIALS,
        HttpStatusCode.UNAUTHORIZED,
      );
    }
    const isBlocked = admin.accountStatus === 'blocked';
    if (isBlocked) {
      throw new HttpError(
        ERROR_MESSAGES.ACCOUNT_BLOCKED,
        HttpStatusCode.FORBIDDEN,
      );
    }

    const accessToken = generateAccessToken({ id: admin._id, role: 'admin' });
    const refreshToken = generateRefreshToken({ id: admin._id, role: 'admin' });

    return { admin, accessToken, refreshToken };
  }
}
