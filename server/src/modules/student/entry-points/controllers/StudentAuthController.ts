import { Request, Response } from 'express';
import { IRegisterStudentUseCase } from '../../application/interfaces/IRegisterStudentUseCase';
import { IOtpService } from '../../../../shared/services/otp/interfaces/IOtpService';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import { HttpError } from '../../../../shared/types/HttpError';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import {
  StudentRegistrationRequestDto,
  StudentVerifyOtpRequestDto,
} from '../../application/dtos/StudentRequestDto';
import { TempInstructorData } from '../../../../shared/services/otp/interfaces/ITempInstructorData ';
import { TempStudentData } from '../../../../shared/services/otp/interfaces/ITempStudentData';

/** Handles HTTP requests for student auth operations. */
export class StudentAuthController {
  /**
   * Constructs the StudentAuthController.
   * @param registerStudentUseCase - Use case for registering students.
   * @param generateOtpUseCase - Service for OTP generation and verification.
   */
  constructor(
    private readonly _registerStudentUseCase: IRegisterStudentUseCase,
    private readonly _generateOtpUseCase: IOtpService<
      TempInstructorData | TempStudentData
    >,
  ) {}

  /**
   * Register student for the StudentAuth entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  registerStudent = async (req: Request, res: Response): Promise<void> => {
    const dto: StudentRegistrationRequestDto = req.body;
    const { fullName, email, password } = dto;

    const isUserExists = await this._registerStudentUseCase.isUserExists(email);
    if (!isUserExists) {
      await this._generateOtpUseCase.storeTempData(email, {
        fullName,
        email,
        password,
      });
      await this._generateOtpUseCase.sendOtp(
        email,
        fullName,
        'student registration',
      );
      ApiResponseHelper.created(res, 'An OTP sent to your mail.');
    } else {
      throw new HttpError(
        ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
        HttpStatusCode.BAD_REQUEST,
      );
    }
  };

  /**
   * Verify otp for the StudentAuth entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    const dto: StudentVerifyOtpRequestDto = req.body;
    await this._registerStudentUseCase.execute(dto.email, dto.Otp);
    ApiResponseHelper.created(res, 'Student Registration Successful.');
  };
}
