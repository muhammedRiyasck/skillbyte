export interface CreateCourseDTO {
  instructorId: string,
  thumbnailUrl: string | null,
  title: string,
  subText: string,
  category: string,
  courseLevel:string,
  language:string,
  price: number,
  features: string[],
  description: string,
  duration: string,
  tags: string[],
  status: "draft" | "published" | "unpublished"
  id?: string,
}
