import { Body, Controller, Post, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user';
import {
  LoginDto,
  MfaVerifyDto,
  RefreshDto,
  RegisterDto,
} from './dto/auth.dto';
import { IsString } from 'class-validator';

class ConfirmMfaDto {
  @IsString()
  secret: string;

  @IsString()
  code: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new organization (tenant) + initial admin.' })
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Authenticate and receive access + refresh tokens.' })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Exchange a refresh token for a new token pair.' })
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @ApiBearerAuth()
  @Post('mfa/enroll')
  @ApiOperation({ summary: 'Begin MFA (TOTP) enrolment; returns secret + QR.' })
  enroll(@CurrentUser() user: AuthenticatedUser) {
    return this.auth.beginMfaEnrollment(user);
  }

  @ApiBearerAuth()
  @Post('mfa/confirm')
  @HttpCode(200)
  @ApiOperation({ summary: 'Confirm MFA enrolment with a TOTP code.' })
  confirm(@CurrentUser() user: AuthenticatedUser, @Body() dto: ConfirmMfaDto) {
    return this.auth.confirmMfaEnrollment(user, dto.secret, dto.code);
  }

  @ApiBearerAuth()
  @Post('mfa/disable')
  @HttpCode(200)
  @ApiOperation({ summary: 'Disable MFA for the current user.' })
   
  disable(@CurrentUser() user: AuthenticatedUser, @Body() _dto: MfaVerifyDto) {
    return this.auth.disableMfa(user);
  }
}
