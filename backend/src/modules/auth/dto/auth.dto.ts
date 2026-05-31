import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '../../../common/enums';

export class LoginDto {
  @ApiProperty({ example: 'dcgi@cdsco.demo' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Ddrs@2026' })
  @IsString()
  password: string;
}

export class RequestOtpDto {
  @ApiProperty({ example: 'manufacturer1@demo.in' })
  @IsString()
  identifier: string;
}

export class VerifyOtpDto {
  @ApiProperty()
  @IsString()
  identifier: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  otp: string;
}

export class AadhaarLoginDto {
  @ApiProperty({ example: '999912345678' })
  @IsString()
  aadhaar: string;

  @ApiProperty({ example: 'citizen@demo.in' })
  @IsEmail()
  email: string;
}

export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  primaryRole: Role;
}
