import {
  ITopInstructorRepository,
  ITopInstructorData,
} from '../../domain/IRepositories/ITopInstructorRepository';
import { TopInstructorModel } from '../models/TopInstructorModel';

/** Manages database operations for top instructor. */
export class TopInstructorRepository implements ITopInstructorRepository {
  /**
   * Replace top instructors for the TopInstructor entity.
   *
   * @param instructors - The instructors information.
   */
  async replaceTopInstructors(
    instructors: ITopInstructorData[],
  ): Promise<void> {
    // In a capped collection, we just insert them and oldest are dropped.
    for (const instructor of instructors) {
      await TopInstructorModel.create(instructor);
    }
  }

  /**
   * Get top instructors for the TopInstructor entity.
   *
   * @returns The result of the operation.
   */
  async getTopInstructors(): Promise<ITopInstructorData[]> {
    const instructors = await TopInstructorModel.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$instructorId',
          doc: { $first: '$$ROOT' },
        },
      },
      { $replaceRoot: { newRoot: '$doc' } },
      { $sort: { totalEarnings: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 1, // Keep the capped collection _id for the frontend key
          name: 1,
          profilePictureUrl: 1,
          totalEarnings: 1,
          averageRating: 1,
          totalReviews: 1,
        },
      },
    ]);

    return instructors.map((inst) => ({
      ...inst,
      _id: inst._id.toString(),
    })) as ITopInstructorData[];
  }
}
