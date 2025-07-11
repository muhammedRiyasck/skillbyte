export class Course {
  constructor(
    public instructorId: string,
    public title: string,
    public description: string,
    public thumbnailUrl: string,
    public price: number,
    public category: string,
    public tags: string[],
    public status: "draft" | "published" | "unpublished" = "draft",
    public id?: string,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}
}
