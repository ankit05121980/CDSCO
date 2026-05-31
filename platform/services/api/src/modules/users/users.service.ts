import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import {
  buildPaginatedResult,
  PaginatedResult,
  PaginationQueryDto,
} from '../../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  /** Returns the user including the (normally hidden) password hash. */
  async findByEmailWithSecret(tenantId: string, email: string): Promise<User | null> {
    return this.repo
      .createQueryBuilder('u')
      .addSelect(['u.passwordHash', 'u.mfaSecret'])
      .where('u.tenantId = :tenantId AND u.email = :email', { tenantId, email })
      .getOne();
  }

  async findByEmailAcrossTenants(email: string): Promise<User[]> {
    return this.repo
      .createQueryBuilder('u')
      .addSelect(['u.passwordHash', 'u.mfaSecret'])
      .where('u.email = :email', { email })
      .getMany();
  }

  async findById(tenantId: string, id: string): Promise<User> {
    const user = await this.repo.findOne({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(tenantId: string, dto: CreateUserDto): Promise<User> {
    const existing = await this.repo.findOne({
      where: { tenantId, email: dto.email.toLowerCase() },
    });
    if (existing) throw new ConflictException('Email already in use');
    const user = this.repo.create({
      tenantId,
      email: dto.email.toLowerCase(),
      displayName: dto.displayName,
      passwordHash: await bcrypt.hash(dto.password, 10),
      roles: dto.roles?.length ? dto.roles : ['VIEWER'],
      department: dto.department,
      status: 'active',
    });
    return this.repo.save(user);
  }

  async update(tenantId: string, id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(tenantId, id);
    Object.assign(user, dto);
    return this.repo.save(user);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const user = await this.findById(tenantId, id);
    await this.repo.remove(user);
  }

  async list(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<User>> {
    const where = query.q
      ? [
          { tenantId, email: ILike(`%${query.q}%`) },
          { tenantId, displayName: ILike(`%${query.q}%`) },
        ]
      : { tenantId };
    const [items, total] = await this.repo.findAndCount({
      where,
      take: query.limit,
      skip: (query.page - 1) * query.limit,
      order: { [query.sortBy || 'createdAt']: query.sortOrder },
    });
    return buildPaginatedResult(items, total, query.page, query.limit);
  }

  async setMfa(tenantId: string, id: string, enabled: boolean, secret?: string) {
    const user = await this.findById(tenantId, id);
    user.mfaEnabled = enabled;
    user.mfaSecret = enabled ? secret : null;
    return this.repo.save(user);
  }

  async recordLogin(tenantId: string, id: string) {
    await this.repo.update({ id, tenantId }, { lastLoginAt: new Date() });
  }

  async count(tenantId: string): Promise<number> {
    return this.repo.count({ where: { tenantId } });
  }
}
