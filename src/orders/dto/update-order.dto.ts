import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { UpdationType } from 'src/commons/dtos';
import { EOrderStatus } from '../orders.enum';
import { CreateOrder } from './create-order.dto';

export class UpdateOrderDto extends UpdationType(
  PartialType(OmitType(CreateOrder, ['cartId'])),
) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(EOrderStatus)
  status?: EOrderStatus;
}
