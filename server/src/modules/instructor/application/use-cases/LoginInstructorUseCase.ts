
import { generateRefreshToken } from "../../../../shared/utils/RefreshToken";
import { generateAccessToken } from "../../../../shared/utils/AccessToken";
import { IInstructorRepository} from "../../domain/IRepositories/IInstructorRepository";
import { Instructor } from "../../domain/entities/Instructor";
import bcrypt from "bcryptjs";
export class LoginInstructorUseCase {
  constructor(
    private instructorRepo: IInstructorRepository
  ) {}

    async execute(email: string, password: string): Promise<{user:Instructor,accessToken:string,refreshToken:string}> {
        const instructor = await this.instructorRepo.findByEmail(email);
        if (!instructor) throw new Error("Invalid credentials");
    
        const isMatch = await bcrypt.compare(password, instructor.passwordHash);
        if (!isMatch) throw new Error("Invalid credentials");

        const accountStatus = instructor.accountStatus

        if(accountStatus == 'pending'){
            throw new Error("Your Account Is Not Approved Yet By Admin.");
        }else if(accountStatus == 'suspended'){
          const error = new Error("Your Account Is Suspended By Admin. Please Contact Support.") as any
          error.status = 403
          throw error
          
        }else if(accountStatus == 'rejected'){
          console.log(true)
          const error = new Error("Your Account Is Rejected By Admin. Please Contact Support.") as any
          error.status = 403
          throw error
        }
      const accessToken = generateAccessToken({ id: instructor._id, role:'instructor' });
      const refreshToken = generateRefreshToken({ id: instructor._id, role:'instructor' });        
      return {user:instructor,accessToken,refreshToken};
    }

}
