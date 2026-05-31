import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List my notifications.' })
  list(@CurrentUser() user: AuthenticatedUser, @Query() query: PaginationQueryDto) {
    return this.notifications.listForUser(user.tenantId, user.userId, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Count my unread notifications.' })
  async unread(@CurrentUser() user: AuthenticatedUser) {
    return { unread: await this.notifications.unreadCount(user.tenantId, user.userId) };
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read.' })
  read(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.notifications.markRead(user.tenantId, user.userId, id);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all my notifications as read.' })
  readAll(@CurrentUser() user: AuthenticatedUser) {
    return this.notifications.markAllRead(user.tenantId, user.userId);
  }
}
