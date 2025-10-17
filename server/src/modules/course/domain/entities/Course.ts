import {Module} from '../entities/Module'
export class Course {
  constructor(
    public instructorId: string,
    public thumbnailUrl: string | null,
    public title: string,
    public subText: string,
    public category: string,
    public courseLevel:string,
    public language:string,
    public price: number,
    public features: string[],
    public description: string,
    public duration: Date,
    public tags: string[],
    public status: "draft" | "list" | "unlist" = "draft",
    public courseId?: string,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public modules?: Module[]
  ) {}
}
