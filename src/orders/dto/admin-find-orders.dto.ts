import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumberString, IsOptional } from 'class-validator';
import { AFindAllDto, FindManyType, FindOneConditions } from 'src/commons/dtos';
import { ESortDirection } from 'src/commons/enums';
import { EOrderStatus, EPaymentMethod } from '../orders.enum';

export class AFindOneOrderConditions extends FindOneConditions {}

export class AFindAllOrdersDto extends AFindAllDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString({}, { each: true })
  id?: string | string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(EPaymentMethod)
  paymentMethod?: EPaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(EOrderStatus)
  status?: EOrderStatus;
}

export class AFindManyOrdersDto extends FindManyType(AFindAllOrdersDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(ESortDirection)
  sortCreatedAt?: ESortDirection;
}
