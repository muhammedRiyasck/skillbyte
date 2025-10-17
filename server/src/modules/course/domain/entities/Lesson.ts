
export class Lesson {
  constructor(
      public moduleId: string ,
      public title: string,
      public description:string,
      public contentType: "video" | "pdf",
      public fileName: string,
      public order: number,
      public duration:number,
      public resources: string[],
      public isFreePreview: boolean = false,
      public isPublished: boolean = false,
      public lessonId?: string ,
      public createdAt?: Date,
      public updatedAt?: Date,
    ) {}
}
