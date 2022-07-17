import { OmitType, PartialType } from '@nestjs/swagger';
import { AUpdationType } from 'src/commons/dtos';
import { ACreateOrder } from './admin-create-order.dto';

export class AUpdateOrderDto extends AUpdationType(
  PartialType(OmitType(ACreateOrder, ['cartId', 'userId'])),
) {}
