import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { UsersService } from '../users/users.service';
import { RbacService } from '../rbac/rbac.service';
import { TenantsService } from '../tenants/tenants.service';
import { JwtConfig } from '../../common/config/configuration';
import { SystemRole } from '../../common/constants/roles';
import { JwtPayload } from './strategies/jwt.strategy';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly rbac: RbacService,
    private readonly tenants: TenantsService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  /** Bootstraps a new tenant with system roles and an initial TENANT_ADMIN. */
  async register(dto: RegisterDto) {
    const tenant = await this.tenants.create(dto.organizationName, dto.organizationSlug);
    await this.rbac.ensureSystemRoles(tenant.id);
    const user = await this.users.create(tenant.id, {
      email: dto.email,
      displayName: dto.displayName,
      password: dto.password,
      roles: [SystemRole.TENANT_ADMIN],
    });
    return this.issueTokens(tenant.id, user.id, user.email, user.roles);
  }

  async login(dto: LoginDto) {
    const tenant = await this.tenants.findBySlug(dto.organizationSlug);
    if (!tenant) throw new UnauthorizedException('Invalid credentials');
    const user = await this.users.findByEmailWithSecret(tenant.id, dto.email.toLowerCase());
    if (!user || user.status === 'disabled') {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    if (user.mfaEnabled) {
      if (!dto.mfaCode) {
        throw new UnauthorizedException('MFA code required');
      }
      const ok = authenticator.verify({ token: dto.mfaCode, secret: user.mfaSecret });
      if (!ok) throw new UnauthorizedException('Invalid MFA code');
    }

    await this.users.recordLogin(tenant.id, user.id);
    return this.issueTokens(tenant.id, user.id, user.email, user.roles);
  }

  async refresh(refreshToken: string) {
    const jwtCfg = this.config.get<JwtConfig>('jwt');
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: jwtCfg.refreshSecret,
        issuer: jwtCfg.issuer,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Not a refresh token');
    }
    const user = await this.users.findById(payload.tid, payload.sub);
    return this.issueTokens(user.tenantId, user.id, user.email, user.roles);
  }

  /** Generates a TOTP secret + provisioning QR for MFA enrolment. */
  async beginMfaEnrollment(user: AuthenticatedUser) {
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(user.email, 'Athena Platform', secret);
    const qrDataUrl = await QRCode.toDataURL(otpauth);
    // Secret returned once for the client to confirm; persisted only on verify.
    return { secret, otpauth, qrDataUrl };
  }

  async confirmMfaEnrollment(user: AuthenticatedUser, secret: string, code: string) {
    const ok = authenticator.verify({ token: code, secret });
    if (!ok) throw new UnauthorizedException('Invalid MFA code');
    await this.users.setMfa(user.tenantId, user.userId, true, secret);
    return { mfaEnabled: true };
  }

  async disableMfa(user: AuthenticatedUser) {
    await this.users.setMfa(user.tenantId, user.userId, false);
    return { mfaEnabled: false };
  }

  private async issueTokens(
    tenantId: string,
    userId: string,
    email: string,
    roles: string[],
  ) {
    const permissions = await this.rbac.resolvePermissions(tenantId, roles);
    const jwtCfg = this.config.get<JwtConfig>('jwt');
    const base = { sub: userId, tid: tenantId, email, roles, permissions };
    const accessToken = await this.jwt.signAsync(
      { ...base, type: 'access' },
      { secret: jwtCfg.accessSecret, expiresIn: jwtCfg.accessTtl, issuer: jwtCfg.issuer },
    );
    const refreshToken = await this.jwt.signAsync(
      { ...base, type: 'refresh' },
      { secret: jwtCfg.refreshSecret, expiresIn: jwtCfg.refreshTtl, issuer: jwtCfg.issuer },
    );
    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      user: { id: userId, tenantId, email, roles, permissions },
    };
  }
}
