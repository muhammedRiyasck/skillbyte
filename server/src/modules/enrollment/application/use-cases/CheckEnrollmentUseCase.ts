import { IEnrollmentRepository } from "../../domain/IEnrollmentRepository";
import { ICheckEnrollment } from "../interface/ICheckEnrollment";

export class CheckEnrollmentUseCase implements ICheckEnrollment {
  
    constructor(private enrollmentRepository: IEnrollmentRepository) {  
    }
    async execute(userId: string, courseId: string) {
        const enrollment = await this.enrollmentRepository.findEnrollment(userId, courseId);
        return enrollment !== null;
    }
}
