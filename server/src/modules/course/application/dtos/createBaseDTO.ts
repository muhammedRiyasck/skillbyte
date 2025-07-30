export interface CreateCourseDTO {
  instructorId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  price: number;
  category: string;
  tags: string[];
}
