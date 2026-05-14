import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import { IQuizConfigRepository } from '../../domain/IRepositories/IQuizConfigRepository';
import { IQuizConfig } from '../../domain/entities/QuizConfig';
import { QuizConfigModel, IQuizConfigDoc } from '../models/QuizConfigModel';
import { Model } from 'mongoose';

export class QuizConfigRepository
  extends BaseRepository<IQuizConfig, IQuizConfigDoc>
  implements IQuizConfigRepository
{
  constructor() {
    super(QuizConfigModel as Model<IQuizConfigDoc>);
  }

  toEntity(doc: IQuizConfigDoc): IQuizConfig {
    return this.mapToEntity(doc as unknown as Record<string, unknown>);
  }

  async create(config: IQuizConfig): Promise<IQuizConfig> {
    const createdConfig = await super.save(config);
    return createdConfig;
  }

  async update(
    courseId: string,
    updates: Partial<IQuizConfig>,
  ): Promise<IQuizConfig | null> {
    const updatedConfig = await this.model
      .findOneAndUpdate({ courseId }, { $set: updates }, { new: true })
      .lean();

    return updatedConfig
      ? this.mapToEntity(updatedConfig as unknown as Record<string, unknown>)
      : null;
  }

  async findByCourseId(courseId: string): Promise<IQuizConfig | null> {
    const config = await this.model.findOne({ courseId }).lean();
    return config
      ? this.mapToEntity(config as unknown as Record<string, unknown>)
      : null;
  }

  async findActiveByCourseId(courseId: string): Promise<IQuizConfig | null> {
    const config = await this.model
      .findOne({ courseId, isEnabled: true })
      .lean();
    return config
      ? this.mapToEntity(config as unknown as Record<string, unknown>)
      : null;
  }

  private mapToEntity(doc: Record<string, unknown>): IQuizConfig {
    const raw = doc as Record<string, unknown> & { _id?: unknown };
    const { _id, ...rest } = raw;
    return {
      configId: _id?.toString(),
      ...rest,
    } as unknown as IQuizConfig;
  }
}
