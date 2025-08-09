
import {CommonAuthController} from '../controllers/CommonAuth.Controller'

import {LoginStudentUseCase} from '../../../student/application/use-cases/LoginStudentUseCase'
import {LoginInstructorUseCase} from '../../../instructor/application/use-cases/LoginInstructorUseCase'

import { OtpRateLimiter } from '../../../../shared/services/otp/OtpRateLimiter'
import { RedisOtpService } from '../../../../shared/services/otp/OtpService'

import {MongoStudentRepository} from '../../../student/infrastructure/repositories/MongoStudentRepository'
import {MongoInstructorRepository} from '../../../instructor/infrastructure/repositories/MongoInstructorRepository'
import { AccessTokenUseCase } from '../../application/AccessTokenUseCase'
import { ResendOtpUseCase } from '../../application/ResendOtpUseCase'

const studentRepo = new MongoStudentRepository();   
const instructorRepo = new MongoInstructorRepository();

const studentLoginUC = new LoginStudentUseCase(studentRepo);
const instructorLoginUC = new LoginInstructorUseCase(instructorRepo);
const accessTokenUC = new AccessTokenUseCase()
const resendOtpUC = new ResendOtpUseCase(new RedisOtpService(),studentRepo,instructorRepo,new OtpRateLimiter())

export const commonAuthController = new CommonAuthController(
    studentLoginUC,
    instructorLoginUC,
    accessTokenUC,
    resendOtpUC
 );
