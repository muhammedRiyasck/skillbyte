import { ContentType } from '../../../../shared/enums/ContentType';

export class Lesson {
  constructor(
    public moduleId: string,
    public title: string,
    public description: string,
    public contentType: ContentType,
    public fileName: string,
    public order: number,
    public duration: number,
    public resources: string[],
    public isFreePreview: boolean = false,
    public isPublished: boolean = false,
    public isBlocked: boolean = false,
    public lessonId?: string,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
