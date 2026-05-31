import { Repository, SelectQueryBuilder, Brackets, ObjectLiteral } from 'typeorm';
import { PaginatedResult, PaginationQueryDto } from '../dto/pagination.dto';

interface PaginateOptions {
  /** Columns (on alias) to apply free-text search across. */
  searchFields?: string[];
  /** Default sort column if none provided. */
  defaultSort?: string;
  /** Whitelist of sortable columns. */
  sortable?: string[];
  /** Exact-match filters: { alias.column: value }. */
  filters?: Record<string, any>;
}

/**
 * Generic paginate/search/sort/filter helper used across all list endpoints.
 */
export async function paginate<T extends ObjectLiteral>(
  repo: Repository<T>,
  alias: string,
  query: PaginationQueryDto,
  options: PaginateOptions = {},
): Promise<PaginatedResult<T>> {
  const qb = repo.createQueryBuilder(alias);
  applyFilters(qb, alias, options.filters);
  applySearch(qb, alias, query.search, options.searchFields);

  const page = Math.max(1, query.page || 1);
  const limit = Math.min(200, Math.max(1, query.limit || 20));

  const sortBy =
    query.sortBy && (options.sortable || []).includes(query.sortBy)
      ? query.sortBy
      : options.defaultSort || 'createdAt';
  const sortOrder = query.sortOrder === 'ASC' ? 'ASC' : 'DESC';
  qb.orderBy(`${alias}.${sortBy}`, sortOrder);

  qb.skip((page - 1) * limit).take(limit);

  const [data, total] = await qb.getManyAndCount();
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

function applyFilters<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  alias: string,
  filters?: Record<string, any>,
) {
  if (!filters) return;
  Object.entries(filters).forEach(([key, value], idx) => {
    if (value === undefined || value === null || value === '') return;
    const param = `f_${idx}`;
    qb.andWhere(`${alias}.${key} = :${param}`, { [param]: value });
  });
}

function applySearch<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  alias: string,
  search?: string,
  fields?: string[],
) {
  if (!search || !fields || fields.length === 0) return;
  qb.andWhere(
    new Brackets((b) => {
      fields.forEach((field, idx) => {
        const param = `s_${idx}`;
        b.orWhere(`${alias}.${field} LIKE :${param}`, {
          [param]: `%${search}%`,
        });
      });
    }),
  );
}
