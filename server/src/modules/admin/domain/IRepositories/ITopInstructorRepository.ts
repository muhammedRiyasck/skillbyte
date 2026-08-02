export interface ITopInstructorData {
  _id?: string;
  instructorId: string;
  name: string;
  profilePictureUrl: string | null;
  totalEarnings: number;
  averageRating: number;
  totalReviews: number;
}

export interface ITopInstructorRepository {
  replaceTopInstructors(instructors: ITopInstructorData[]): Promise<void>;
  getTopInstructors(): Promise<ITopInstructorData[]>;
}
