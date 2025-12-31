import { Model, Document } from 'mongoose';
import { IBaseRepository } from './IBaseRepository';

export abstract class BaseRepository<T, D extends Document>
  implements IBaseRepository<T>
{
  protected model: Model<D>;

  constructor(model: Model<D>) {
    this.model = model;
  }

  abstract toEntity(doc: D): T;

  async save(data: unknown): Promise<T> {
    const created = (await this.model.create(
      data as unknown as D,
    )) as unknown as D;
    return this.toEntity(created);
  }

  async findById(id: string): Promise<T | null> {
    const doc = await this.model.findById(id);
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async findAll(): Promise<T[] | null> {
    const docs = await this.model.find({});
    return docs.map((doc) => this.toEntity(doc));
  }

  async paginatedList(
    filter: Record<string, unknown>,
    page: number,
    limit: number,
    sort: Record<string, 1 | -1> = { createdAt: -1 },
  ): Promise<{ data: T[]; total: number }> {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(limit, 50);
    const skip = (safePage - 1) * safeLimit;

    const [rawData, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip(skip).limit(safeLimit),
      this.model.countDocuments(filter),
    ]);

    const data: T[] = rawData.map((doc) => this.toEntity(doc));

    return { data, total };
  }

  async deleteById(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id);
  }
}
