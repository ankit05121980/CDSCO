import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grievance } from './grievance.entity';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/paginate';

@Injectable()
export class GrievancesService {
  private seq = 900000;
  constructor(
    @InjectRepository(Grievance) private readonly repo: Repository<Grievance>,
  ) {}

  private ticketNo() {
    return `GRV/2026/${++this.seq}`;
  }

  list(query: PaginationQueryDto & { status?: string; category?: string }) {
    return paginate(this.repo, 'g', query, {
      searchFields: ['ticketNo', 'subject', 'complainantName', 'category'],
      sortable: ['createdAt', 'status', 'priority', 'dueDate'],
      defaultSort: 'createdAt',
      filters: { status: query.status, category: query.category },
    });
  }

  async findByTicket(ticketNo: string) {
    const g = await this.repo.findOne({ where: { ticketNo } });
    if (!g) throw new NotFoundException('Grievance not found');
    return g;
  }

  create(data: Partial<Grievance>) {
    const slaDays = data.slaDays || 7;
    return this.repo.save(
      this.repo.create({
        ...data,
        ticketNo: this.ticketNo(),
        status: 'OPEN',
        slaDays,
        dueDate: new Date(Date.now() + slaDays * 86400000),
        channel: data.channel || 'WEB',
      }),
    );
  }

  async update(id: string, data: Partial<Grievance>) {
    const g = await this.repo.findOne({ where: { id } });
    if (!g) throw new NotFoundException('Grievance not found');
    Object.assign(g, data);
    if (data.status === 'RESOLVED' || data.status === 'CLOSED') g.resolvedAt = new Date();
    return this.repo.save(g);
  }

  async stats() {
    const total = await this.repo.count();
    const byStatus = await this.repo.createQueryBuilder('g').select('g.status', 'status').addSelect('COUNT(*)', 'count').groupBy('g.status').getRawMany();
    const byCategory = await this.repo.createQueryBuilder('g').select('g.category', 'category').addSelect('COUNT(*)', 'count').groupBy('g.category').getRawMany();
    return { total, byStatus, byCategory };
  }
}
