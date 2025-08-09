
import { generateRefreshToken } from "../../../../shared/utils/RefreshToken";
import { generateAccessToken } from "../../../../shared/utils/AccessToken";
import { IInstructorRepository} from "../../domain/IRepositories/IinstructorRepository";
import { Instructor } from "../../domain/entities/Instructor";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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
          throw new Error("Your Account Is Suspended By Admin. Please Contact Support.");
        }else if(accountStatus == 'rejected'){
          throw new Error("Your Account Is Rejected By Admin. Please Contact Support.");
        }
        
      const accessToken = generateAccessToken({ id: instructor._id, role:'instructor' });
      const refreshToken = generateRefreshToken({ id: instructor._id, role:'instructor' });        
      return {user:instructor,accessToken,refreshToken};
    }

}
