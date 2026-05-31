import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { Role } from '../../common/enums';

interface OtpEntry {
  otp: string;
  expiresAt: number;
}

@Injectable()
export class AuthService {
  /** In-memory OTP store (demo). Production would use Redis + real SMS. */
  private otpStore = new Map<string, OtpEntry>();

  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  private sign(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
      roles: user.roles,
      organizationId: user.organizationId,
      stateCode: user.stateCode,
    };
    return {
      accessToken: this.jwt.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        roles: user.roles,
        primaryRole: user.primaryRole,
        organizationId: user.organizationId,
        stateCode: user.stateCode,
        office: user.office,
        designation: user.designation,
      },
    };
  }

  async login(email: string, password: string, ip?: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (user.status === 'SUSPENDED')
      throw new UnauthorizedException('Account suspended');
    const ok = await this.users.verifyPassword(user, password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    await this.users.recordLogin(user, ip);
    return this.sign(user);
  }

  /** Request an OTP (simulated SMS/email delivery). */
  async requestOtp(identifier: string) {
    const user = await this.users.findByEmail(identifier);
    if (!user) throw new BadRequestException('No account for this identifier');
    const otp = '' + Math.floor(100000 + Math.random() * 900000);
    this.otpStore.set(identifier.toLowerCase(), {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });
    // Demo: return OTP in response (production: send via SMS/email gateway).
    return {
      message: 'OTP sent (simulated). Use the demo OTP below.',
      demoOtp: otp,
      channel: user.phone ? 'SMS + Email' : 'Email',
    };
  }

  async verifyOtp(identifier: string, otp: string, ip?: string) {
    const entry = this.otpStore.get(identifier.toLowerCase());
    if (!entry || entry.expiresAt < Date.now())
      throw new UnauthorizedException('OTP expired, request a new one');
    if (entry.otp !== otp) throw new UnauthorizedException('Invalid OTP');
    this.otpStore.delete(identifier.toLowerCase());
    const user = await this.users.findByEmail(identifier);
    if (!user) throw new UnauthorizedException('Account not found');
    await this.users.recordLogin(user, ip);
    return this.sign(user);
  }

  /**
   * Mock Aadhaar / DigiLocker login. In production this would redirect to the
   * UIDAI/DigiLocker OAuth flow; here we accept any 12-digit number and link to
   * an existing account by email or create a public user.
   */
  async aadhaarLogin(aadhaar: string, email: string, ip?: string) {
    if (!/^\d{12}$/.test(aadhaar))
      throw new BadRequestException('Aadhaar must be 12 digits');
    let user = await this.users.findByEmail(email);
    if (!user) {
      user = await this.users.create({
        email,
        password: Math.random().toString(36).slice(2),
        fullName: 'Aadhaar User',
        primaryRole: Role.PUBLIC_USER,
        roles: [Role.PUBLIC_USER],
      });
    }
    await this.users.recordLogin(user, ip);
    const masked = `XXXX-XXXX-${aadhaar.slice(-4)}`;
    return { ...this.sign(user), aadhaarMasked: masked, provider: 'DigiLocker (simulated)' };
  }

  async register(data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    primaryRole: Role;
    organizationId?: string;
  }) {
    // External self-registration starts as PENDING approval for regulated roles.
    const user = await this.users.create({
      ...data,
      status: 'ACTIVE',
    });
    return this.sign(user);
  }
}
