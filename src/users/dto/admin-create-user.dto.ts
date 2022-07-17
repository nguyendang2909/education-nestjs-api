import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { EGender, ERole } from '../users.enum';

export class ACreateUser {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullname: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsDateString()
  birthday?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  address?: string;

  @ApiPropertyOptional({ type: String })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  @IsPhoneNumber('VN')
  phoneNumber?: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsEnum(EGender)
  gender?: EGender;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  experience?: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsEnum(ERole)
  role?: ERole;
}

export class ACreateUserDto extends ACreateUser {}
