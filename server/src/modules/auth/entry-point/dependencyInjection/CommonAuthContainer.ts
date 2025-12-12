
import {CommonAuthController} from '../controllers/CommonAuth.controller'

import {LoginStudentUseCase} from '../../../student/application/use-cases/LoginStudentUseCase'
import {LoginInstructorUseCase} from '../../../instructor/application/use-cases/LoginInstructorUseCase'
import { AccessTokenUseCase } from '../../application/use-cases/AccessTokenUseCase'
import { ResendOtpUseCase } from '../../application/use-cases/ResendOtpUseCase'
import { ForgotPasswordUseCase } from '../../application/use-cases/ForgotPasswordUseCase'
import { ResetPasswordUseCase} from '../../application/use-cases/ResetPasswordUseCase'
import { AmILoggedInUseCase } from '../../application/use-cases/AmILoggedInUseCase'

import { OtpRateLimiter } from '../../../../shared/services/otp/OtpRateLimiter'
import { RedisOtpService } from '../../../../shared/services/otp/OtpService'

import {StudentRepository} from '../../../student/infrastructure/repositories/StudentRepository'
import {InstructorRepository} from '../../../instructor/infrastructure/repositories/InstructorRepository'
import {AdminRepository} from '../../../admin/infrastructure/repositories/AdminRepository'

const studentRepo = new StudentRepository();   
const instructorRepo = new InstructorRepository();
const adminRepo = new AdminRepository();


const studentLoginUC = new LoginStudentUseCase(studentRepo);
const instructorLoginUC = new LoginInstructorUseCase(instructorRepo);
const accessTokenUC = new AccessTokenUseCase()
const resendOtpUC = new ResendOtpUseCase(new RedisOtpService(60),new OtpRateLimiter())
const forgotPasswordUc = new ForgotPasswordUseCase(studentRepo,instructorRepo)
const resetPasswordUc = new ResetPasswordUseCase(studentRepo,instructorRepo)
const amILoggedLoginUc = new AmILoggedInUseCase(studentRepo,instructorRepo,adminRepo);

export const commonAuthController = new CommonAuthController(
    studentLoginUC,
    instructorLoginUC,
    accessTokenUC,
    resendOtpUC,
    forgotPasswordUc,
    resetPasswordUc,
    amILoggedLoginUc
 );
