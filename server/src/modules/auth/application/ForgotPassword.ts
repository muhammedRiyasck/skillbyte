
import { IStudentRepository } from '../../student/domain/IRepositories/IStudentRepository';
import { IInstructorRepository} from '../../instructor/domain/IRepositories/IinstructorRepository';
import {createPasswordResetToken} from '../../../shared/utils/TokenGenrator'
import {NodeMailerService} from '../../../shared/services/mail/NodeMailerService'
import { ResetPasswordTemplate } from '../../../shared/templates/ResetPassword';
import redis from '../../../shared/utils/Redis'

export class ForgotPasswordUseCase{
   private NodeMailer
    constructor(
      private studentRepo : IStudentRepository,
      private instructorRepo : IInstructorRepository,
    ){
      this.NodeMailer = new NodeMailerService
    }
    
    async execute(email:string,role:string){
        const repo = role === 'student' ? this.studentRepo : this.instructorRepo
        const user = await repo.findByEmail(email)
        console.log(user)
        if(!user){
            return false
        }
        const token = await createPasswordResetToken(user._id!)
        console.log(process.env.FRONTEND_URL,'fronted url')
        const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}&role=${role}`;
        
     
     try {
      await this.NodeMailer.sendMail(  user.email, 'Reset your password', ResetPasswordTemplate(user.name,resetUrl) );

    } catch (e:any) {
      await redis.del(`reset:${token}`);
      console.error(e.message)
      throw new Error(e.message)
    }
  }
}
