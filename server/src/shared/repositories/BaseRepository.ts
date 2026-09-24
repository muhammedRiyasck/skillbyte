import { Model, Document, FilterQuery } from 'mongoose';
import { IBaseRepository } from './IBaseRepository';

/** Manages database operations for base. */
export abstract class BaseRepository<T, D extends Document>
  implements IBaseRepository<T>
{
  protected model: Model<D>;

  constructor(model: Model<D>) {
    this.model = model;
  }

  /**
   * To entity for the Base entity.
   *
   * @param doc - The doc information.
   * @returns The result of the operation.
   */
  abstract toEntity(doc: D): T;

  /**
   * Save for the Base entity.
   *
   * @param data - The data information.
   * @returns The result of the operation.
   */
  async save(data: unknown): Promise<T> {
    const created = (await this.model.create(data as D)) as D;
    return this.toEntity(created);
  }

  /**
   * Find by id for the Base entity.
   *
   * @param id - The unique identifier for the id.
   * @returns The result of the operation.
   */
  async findById(id: string): Promise<T | null> {
    const doc = await this.model.findById(id);
    if (!doc) return null;
    return this.toEntity(doc);
  }

  /**
   * Find by ids for the Base entity.
   *
   * @param ids - The unique identifier for the ids.
   * @returns The result of the operation.
   */
  async findByIds(ids: string[]): Promise<T[]> {
    if (!ids.length) return [];

    const docs = await this.model.find({
      _id: { $in: ids },
    } as FilterQuery<D>);

    return docs.map((doc) => this.toEntity(doc));
  }

  /**
   * Find all for the Base entity.
   *
   * @returns The result of the operation.
   */
  async findAll(): Promise<T[] | null> {
    const docs = await this.model.find({});
    return docs.map((doc) => this.toEntity(doc));
  }

  /**
   * Paginated list for the Base entity.
   *
   * @param filter - The filter information.
   * @param page - The page information.
   * @param limit - The limit information.
   * @param sort - The sort information.
   * @returns The result of the operation.
   */
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

  /**
   * Delete by id for the Base entity.
   *
   * @param id - The unique identifier for the id.
   */
  async deleteById(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id);
  }
}
