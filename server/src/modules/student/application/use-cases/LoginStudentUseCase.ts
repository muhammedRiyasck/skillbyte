
import { generateRefreshToken } from "../../../../shared/utils/RefreshToken";
import { generateAccessToken } from "../../../../shared/utils/AccessToken";
import { IStudentRepository} from "../../domain/IRepositories/IStudentRepository";
import { Student } from "../../domain/entities/Student";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
export class LoginStudentUseCase {
  constructor(
    private studentRepo: IStudentRepository
  ) {}

    async execute(email: string, password: string): Promise<{user:Student,accessToken:string,refreshToken:string}> {
        const student = await this.studentRepo.findByEmail(email);

        if (!student) throw new Error("Invalid credentials");

        const isMatch = await bcrypt.compare(password, student.passwordHash);
        if (!isMatch) throw new Error("Invalid credentials");
    
        
        const isBlocked = student.accountStatus === 'blocked';
        if (isBlocked) throw new Error("Account is Blocked. Please contact support.");
        const accessToken = generateAccessToken({ id: student._id, role:'student' });
        const refreshToken = generateRefreshToken({ id: student._id, role:'student' });
        return {user:student,accessToken,refreshToken};
    }

    // async

}
