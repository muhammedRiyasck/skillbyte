import redis from "../../../shared/utils/Redis";
import bcrypt from 'bcryptjs'
import {password as validate} from '../../../shared/validation/Password'
import {IStudentRepository} from '../../student/domain/IRepositories/IStudentRepository'
import {IInstructorRepository} from '../../instructor/domain/IRepositories/IinstructorRepository'
import {NodeMailerService} from '../../../shared/services/mail/NodeMailerService'
import { SuccessResetPasswordTemplate } from "../../../shared/templates/SuccessResetPassword";

export class ResetPasswordUseCase{
    private NodeMailer
    constructor(
        private readonly studentRepo:IStudentRepository,
        private readonly instructorRepo:IInstructorRepository
    ){
        this.NodeMailer = new NodeMailerService()
    }
 async execute(token:string,password:string,role:string){

      const userId = await redis.get(`reset:${token}`);
      console.log(userId)
      if (!userId) throw new Error("Invalid or expired token")
      const {value:newPassword} = new validate(password)
      console.log('new password', newPassword)
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const user = role === 'student'? this.studentRepo:this.instructorRepo
      const isPasswordReseted = await user.findByIdAndUpdatePassword(userId,hashedPassword)
        if(isPasswordReseted){
       await redis.del(`reset:${token}`);
       await this.NodeMailer.sendMail(isPasswordReseted.email,'Your password was changed',SuccessResetPasswordTemplate(isPasswordReseted.name));
    }else{
        console.log('password not reseted')
        throw new Error('Something went Wrong While Reseting!!')
    }

    }
}
