
import {CommonAuthController} from '../controllers/CommonAuth.Controller'

import {LoginStudentUseCase} from '../../../student/application/use-cases/LoginStudentUseCase'
import {LoginInstructorUseCase} from '../../../instructor/application/use-cases/LoginInstructorUseCase'
import { AccessTokenUseCase } from '../../application/AccessTokenUseCase'
import { ResendOtpUseCase } from '../../application/ResendOtpUseCase'
import { ForgotPasswordUseCase } from '../../application/ForgotPassword'
import { ResetPasswordUseCase} from '../../application/ResetPassword'
import { GoogleLoginUseCase } from '../../application/GoogleLogin'

import { OtpRateLimiter } from '../../../../shared/services/otp/OtpRateLimiter'
import { RedisOtpService } from '../../../../shared/services/otp/OtpService'

import {MongoStudentRepository} from '../../../student/infrastructure/repositories/MongoStudentRepository'
import {MongoInstructorRepository} from '../../../instructor/infrastructure/repositories/MongoInstructorRepository'

const studentRepo = new MongoStudentRepository();   
const instructorRepo = new MongoInstructorRepository();

const studentLoginUC = new LoginStudentUseCase(studentRepo);
const instructorLoginUC = new LoginInstructorUseCase(instructorRepo);
const accessTokenUC = new AccessTokenUseCase()
const resendOtpUC = new ResendOtpUseCase(new RedisOtpService(60),new OtpRateLimiter())
const forgotPasswordUc = new ForgotPasswordUseCase(studentRepo,instructorRepo)
const resetPasswordUc = new ResetPasswordUseCase(studentRepo,instructorRepo)
const googleLoginUc = new GoogleLoginUseCase(studentRepo,instructorRepo)

export const commonAuthController = new CommonAuthController(
    studentLoginUC,
    instructorLoginUC,
    accessTokenUC,
    resendOtpUC,
    forgotPasswordUc,
    resetPasswordUc,
    googleLoginUc
 );
