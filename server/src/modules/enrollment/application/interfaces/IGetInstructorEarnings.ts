import { IInstructorEarnings } from '../../types/IPaymentHistory';

export interface IGetInstructorEarnings {
  execute(
    instructorId: string,
    page: number,
    limit: number,
  ): Promise<IInstructorEarnings[]>;
}
