import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { Role } from '../../common/enums';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/paginate';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email: email.toLowerCase() } });
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async findAll(query: PaginationQueryDto & { role?: string; status?: string }) {
    return paginate(this.repo, 'user', query, {
      searchFields: ['email', 'fullName', 'phone', 'office', 'designation'],
      sortable: ['createdAt', 'fullName', 'email', 'status', 'primaryRole'],
      defaultSort: 'createdAt',
      filters: { primaryRole: query.role, status: query.status },
    });
  }

  async getProfile(id: string) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash, ...rest } = user;
    return rest;
  }

  async create(data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    primaryRole: Role;
    roles?: Role[];
    organizationId?: string;
    stateCode?: string;
    office?: string;
    designation?: string;
    status?: User['status'];
  }) {
    const email = data.email.toLowerCase();
    const existing = await this.findByEmail(email);
    if (existing) throw new ConflictException('Email already registered');
    const user = this.repo.create({
      ...data,
      email,
      passwordHash: await bcrypt.hash(data.password, 10),
      roles: data.roles && data.roles.length ? data.roles : [data.primaryRole],
      status: data.status || 'ACTIVE',
    });
    return this.repo.save(user);
  }

  async verifyPassword(user: User, password: string) {
    return bcrypt.compare(password, user.passwordHash);
  }

  async recordLogin(user: User, ip?: string) {
    user.lastLoginAt = new Date();
    user.lastLoginIp = ip;
    await this.repo.save(user);
  }

  async updateStatus(id: string, status: User['status']) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    user.status = status;
    return this.repo.save(user);
  }

  async stats() {
    const total = await this.repo.count();
    const byRole = await this.repo
      .createQueryBuilder('u')
      .select('u.primaryRole', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('u.primaryRole')
      .getRawMany();
    return { total, byRole };
  }
}
