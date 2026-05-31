import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/paginate';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
  ) {}

  list(query: PaginationQueryDto & { category?: string; status?: string; manufacturerId?: string }) {
    return paginate(this.repo, 'p', query, {
      searchFields: ['name', 'brandName', 'genericName', 'registrationNo', 'manufacturerName'],
      sortable: ['createdAt', 'name', 'brandName', 'category', 'status'],
      defaultSort: 'name',
      filters: {
        category: query.category,
        status: query.status,
        manufacturerId: query.manufacturerId,
      },
    });
  }

  async findOne(id: string) {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }

  /** Brand-name duplication check (RFP: avoid duplicate brand names). */
  async checkBrand(brandName: string) {
    const existing = await this.repo.find({
      where: { brandName },
      take: 5,
    });
    return { brandName, duplicate: existing.length > 0, matches: existing };
  }

  async create(data: Partial<Product>) {
    if (data.brandName) {
      const dup = await this.repo.findOne({ where: { brandName: data.brandName } });
      if (dup)
        throw new ConflictException(
          `Brand name "${data.brandName}" already exists (Reg. ${dup.registrationNo})`,
        );
    }
    return this.repo.save(this.repo.create(data));
  }

  async stats() {
    const total = await this.repo.count();
    const byCategory = await this.repo
      .createQueryBuilder('p')
      .select('p.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .groupBy('p.category')
      .getRawMany();
    return { total, byCategory };
  }
}
