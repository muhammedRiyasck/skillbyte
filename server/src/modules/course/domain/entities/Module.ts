import { Lesson } from './Lesson';

export class Module {
  constructor(
    public courseId: string,
    public title: string,
    public description: string,
    public order: number,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public moduleId?: string,
    public lessons?: Lesson[],
  ) {}
}
