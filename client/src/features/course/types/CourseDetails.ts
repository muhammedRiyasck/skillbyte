import type { ModuleType } from "./IModule";

export interface CourseDetailsResponse {
  data: CourseDetails;
  message: string;
  success: boolean;
}

export interface CourseDetails {
  courseId: string;
  instructorId: string;
  instructor?: InstructorInfo;
  thumbnailUrl: string | null;
  title: string;
  subText: string;
  category: string;
  courseLevel: string;
  language: string;
  price: number;
  features: string[];
  description: string;
  duration: string;
  tags: string[];
  status: "draft" | "list" | "unlist";
  createdAt: string;
  updatedAt: string;
  modules?: ModuleType[];
}

 interface InstructorInfo {
  name: string;
  title: string;
  avatar: string;
  bio: string;
}

// export interface Review {
//   id: string;
//   user: string;
//   avatar: string;
//   rating: number;
//   comment: string;
//   date: string;
// }
