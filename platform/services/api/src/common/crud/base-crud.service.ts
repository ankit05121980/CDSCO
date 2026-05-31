import { NotFoundException } from '@nestjs/common';
import { DeepPartial, ILike, ObjectLiteral, Repository } from 'typeorm';
import {
  buildPaginatedResult,
  PaginatedResult,
  PaginationQueryDto,
} from '../dto/pagination.dto';

/**
 * Generic, tenant-scoped CRUD service. Concrete resource services extend this
 * to inherit consistent list/get/create/update/remove behaviour with hard
 * tenant isolation and pagination, eliminating repetitive boilerplate.
 */
export abstract class BaseCrudService<
  T extends ObjectLiteral & { id: string; tenantId: string },
> {
  protected constructor(
    protected readonly repo: Repository<T>,
    /** Columns eligible for `q` substring search. */
    protected readonly searchFields: (keyof T)[] = [],
    protected readonly resourceName = 'Resource',
  ) {}

  /** Hook for subclasses to enrich/normalize a record before insert. */
  protected beforeCreate(_tenantId: string, data: DeepPartial<T>): DeepPartial<T> {
    return data;
  }

  protected beforeUpdate(entity: T, data: DeepPartial<T>): void {
    Object.assign(entity, data);
  }

  async list(tenantId: string, query: PaginationQueryDto): Promise<PaginatedResult<T>> {
    const baseWhere = { tenantId } as Record<string, unknown>;
    const where =
      query.q && this.searchFields.length
        ? this.searchFields.map((f) => ({ ...baseWhere, [f]: ILike(`%${query.q}%`) }))
        : baseWhere;
    const [items, total] = await this.repo.findAndCount({
      where: where as never,
      take: query.limit,
      skip: (query.page - 1) * query.limit,
      order: { [query.sortBy || 'createdAt']: query.sortOrder } as never,
    });
    return buildPaginatedResult(items, total, query.page, query.limit);
  }

  async get(tenantId: string, id: string): Promise<T> {
    const entity = await this.repo.findOne({ where: { id, tenantId } as never });
    if (!entity) throw new NotFoundException(`${this.resourceName} not found`);
    return entity;
  }

  async create(tenantId: string, data: DeepPartial<T>): Promise<T> {
    const prepared = this.beforeCreate(tenantId, { ...data, tenantId } as DeepPartial<T>);
    return this.repo.save(this.repo.create(prepared));
  }

  async update(tenantId: string, id: string, data: DeepPartial<T>): Promise<T> {
    const entity = await this.get(tenantId, id);
    this.beforeUpdate(entity, data);
    return this.repo.save(entity);
  }

  async remove(tenantId: string, id: string): Promise<{ deleted: true }> {
    const entity = await this.get(tenantId, id);
    await this.repo.remove(entity);
    return { deleted: true };
  }

  async count(tenantId: string): Promise<number> {
    return this.repo.count({ where: { tenantId } as never });
  }
}
