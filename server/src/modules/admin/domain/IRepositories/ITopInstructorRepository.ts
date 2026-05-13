export interface ITopInstructorData {
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
