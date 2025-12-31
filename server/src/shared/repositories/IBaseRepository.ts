export interface IBaseRepository<T> {
  save(data: unknown): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[] | null>;
  paginatedList(
    filter: Record<string, unknown>,
    page: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ): Promise<{ data: T[]; total: number }>;
  deleteById(id: string): Promise<void>;
}
