import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant) private readonly repo: Repository<Tenant>,
  ) {}

  async create(name: string, slug: string): Promise<Tenant> {
    const existing = await this.repo.findOne({ where: { slug } });
    if (existing) throw new ConflictException('Tenant slug already exists');
    return this.repo.save(this.repo.create({ name, slug, plan: 'enterprise', status: 'active' }));
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    return this.repo.findOne({ where: { slug } });
  }

  async findById(id: string): Promise<Tenant> {
    const tenant = await this.repo.findOne({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async list(): Promise<Tenant[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }
}
