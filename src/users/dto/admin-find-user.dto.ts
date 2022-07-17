import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBooleanString, IsEnum, IsOptional, IsString } from 'class-validator';
import { FindManyType, FindOneConditions } from 'src/commons/dtos';
import { BooleanString } from 'src/commons/types';
import { ERegisterTeacher, ERole } from '../users.enum';

export class AFindAllUsersDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  role?: ERole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBooleanString()
  isActive?: BooleanString;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(ERegisterTeacher)
  registerTeacher?: ERegisterTeacher;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fullname?: string;
}

export class AFindManyUsersDto extends FindManyType(AFindAllUsersDto) {}

export class AFindOneUserConditions extends FindOneConditions {}
