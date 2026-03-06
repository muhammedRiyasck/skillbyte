import { InstructorAccountStatus } from '../../../../shared/enums/InstructorAccountStatus';

export interface IChangeInstructorStatusUseCase {
  execute(
    id: string,
    status: InstructorAccountStatus.ACTIVE | InstructorAccountStatus.SUSPENDED,
    note?: string,
  ): Promise<void>;
}
