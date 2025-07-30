export class Lesson {
  constructor(
      public moduleId: string,
      public title: string,
      public contentType: "video" | "pdf",
      public contentUrl: string,
      public order: number,
      public isFreePreview: boolean = false,
      public isPublished: boolean = false,
      public id?: string ,
      public createdAt: Date = new Date(),
      public updatedAt: Date = new Date(),
    ) {}
}
