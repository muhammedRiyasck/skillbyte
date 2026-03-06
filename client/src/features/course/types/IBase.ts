import { CourseStatus } from "@shared/enums/CourseStatus";

export interface Ibase {
    id: string;
    instructorId?: string;
    thumbnailUrl: string
    title: string;
    subText: string;
    category: string;
    customCategory: string;
    courseLevel: string;
    duration: string;
    language: string;
    price: string;
    description: string;
    tags: string;
    features: string[];
    status: CourseStatus;
    rating: number;
    reviews: number;
    isEnrolled?: boolean;
    isBlocked?: boolean;
}
