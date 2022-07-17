import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ActivationType, UpdationType } from 'src/commons/dtos';
import { ERegisterTeacher } from '../users.enum';
import { ACreateUser } from './admin-create-user.dto';

export class AUpdateUserDto extends UpdationType(
  PartialType(ActivationType(OmitType(ACreateUser, ['email']))),
) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(ERegisterTeacher)
  registerTeacher?: ERegisterTeacher;
}
