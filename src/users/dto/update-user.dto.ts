import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ActivationType, UpdationType } from 'src/commons/dtos';
import { ERegisterTeacher } from '../users.enum';
import { CreateUser } from './create-user.dto';

export class UpdateCurrentUserDto extends UpdationType(
  PartialType(ActivationType(OmitType(CreateUser, ['email']))),
) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  oldPassword?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(ERegisterTeacher)
  registerTeacher?: ERegisterTeacher;
}
