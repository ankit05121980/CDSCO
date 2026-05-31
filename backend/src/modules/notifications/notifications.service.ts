import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './notification.entity';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/paginate';

interface NotifyInput {
  userId?: string;
  title: string;
  message: string;
  type?: NotificationType;
  category?: string;
  link?: string;
  relatedId?: string;
  channels?: string[]; // default ['IN_APP']
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  /**
   * Creates notifications across the requested channels. Email/SMS delivery is
   * simulated (logged as a row); IN_APP is shown in the portal bell.
   */
  async notify(input: NotifyInput) {
    const channels = input.channels && input.channels.length ? input.channels : ['IN_APP'];
    const created: Notification[] = [];
    for (const channel of channels) {
      const n = this.repo.create({
        userId: input.userId,
        title: input.title,
        message: input.message,
        type: input.type || 'INFO',
        category: input.category,
        link: input.link,
        relatedId: input.relatedId,
        channel,
        read: false,
      });
      created.push(await this.repo.save(n));
    }
    return created;
  }

  forUser(userId: string, query: PaginationQueryDto) {
    return paginate(this.repo, 'n', query, {
      searchFields: ['title', 'message', 'category'],
      sortable: ['createdAt', 'type', 'read'],
      defaultSort: 'createdAt',
      filters: { userId, channel: 'IN_APP' },
    });
  }

  async unreadCount(userId: string) {
    const count = await this.repo.count({
      where: { userId, read: false, channel: 'IN_APP' },
    });
    return { unread: count };
  }

  async markRead(id: string, userId: string) {
    await this.repo.update({ id, userId }, { read: true });
    return { ok: true };
  }

  async markAllRead(userId: string) {
    await this.repo.update({ userId, read: false }, { read: true });
    return { ok: true };
  }
}
