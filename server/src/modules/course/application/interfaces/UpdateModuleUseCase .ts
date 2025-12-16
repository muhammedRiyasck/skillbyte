import { Module } from '../../domain/entities/Module';

type UpdatableModuleFields = Omit<
  Module,
  'createdAt' | 'updatedAt' | 'courseId'
>;
type IUpdatableModule = Partial<UpdatableModuleFields>;

export interface IUpdateModuleUseCase {
  execute(
    moduleId: string,
    instructorId: string,
    updates: IUpdatableModule,
  ): Promise<void>;
}
