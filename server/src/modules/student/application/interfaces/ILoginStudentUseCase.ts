
import { Student } from "../../domain/entities/Student";

export interface ILoginStudentUseCase{
execute(email: string, password: string): Promise<{user:Student,accessToken:string,refreshToken:string}>
}
