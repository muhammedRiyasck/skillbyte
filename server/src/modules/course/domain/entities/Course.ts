import { Module } from '../entities/Module';
import { CourseStatus } from '../../../../shared/enums/CourseStatus';

export class Course {
  constructor(
    public instructorId: string,
    public thumbnailUrl: string | null,
    public title: string,
    public subText: string,
    public category: string,
    public courseLevel: string,
    public language: string,
    public price: number,
    public features: string[],
    public description: string,
    public duration: string,
    public tags: string[],
    public status: CourseStatus = CourseStatus.DRAFT,
    public isBlocked: boolean = false,
    public courseId?: string,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public modules?: Module[],
    public averageRating: number = 0,
    public totalReviews: number = 0,
    public isQuizEnabled: boolean = false,
  ) {}
}
