import { Lesson } from '../../domain/entities/Lesson';

type WithInstructorId<Lesson> = Lesson & { instructorId: string };

export interface ICreateLessonUseCase {
  execute(dto: WithInstructorId<Lesson>): Promise<Lesson>;
}
