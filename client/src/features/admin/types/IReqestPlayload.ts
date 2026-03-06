import { InstructorAccountStatus } from "@shared/enums/InstructorAccountStatus";

export interface IReqestPlayload {
    id: string;
    reason?: string
    status?: InstructorAccountStatus.ACTIVE | InstructorAccountStatus.SUSPENDED;
}
