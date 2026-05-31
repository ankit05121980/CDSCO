import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import {
  buildPaginatedResult,
  PaginatedResult,
  PaginationQueryDto,
} from '../../common/dto/pagination.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private readonly repo: Repository<Notification>,
  ) {}

  async notify(
    tenantId: string,
    recipientId: string,
    title: string,
    body?: string,
    data?: Record<string, unknown>,
  ): Promise<Notification> {
    return this.repo.save(
      this.repo.create({ tenantId, recipientId, title, body, data, channel: 'in_app' }),
    );
  }

  async listForUser(
    tenantId: string,
    recipientId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Notification>> {
    const [items, total] = await this.repo.findAndCount({
      where: { tenantId, recipientId },
      take: query.limit,
      skip: (query.page - 1) * query.limit,
      order: { createdAt: query.sortOrder },
    });
    return buildPaginatedResult(items, total, query.page, query.limit);
  }

  async unreadCount(tenantId: string, recipientId: string): Promise<number> {
    return this.repo.count({ where: { tenantId, recipientId, read: false } });
  }

  async markRead(tenantId: string, recipientId: string, id: string): Promise<Notification> {
    const n = await this.repo.findOne({ where: { id, tenantId, recipientId } });
    if (!n) throw new NotFoundException('Notification not found');
    n.read = true;
    return this.repo.save(n);
  }

  async markAllRead(tenantId: string, recipientId: string): Promise<{ updated: number }> {
    const res = await this.repo.update({ tenantId, recipientId, read: false }, { read: true });
    return { updated: res.affected ?? 0 };
  }
}
