import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { CreationType } from 'src/commons/dtos';
import { EPaymentMethod } from '../orders.enum';

export class CreateOrder {
  @ApiPropertyOptional({ enum: EPaymentMethod })
  @IsOptional()
  @IsEnum(EPaymentMethod)
  paymentMethod?: EPaymentMethod;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber({}, { each: true })
  cartId: number | number[];
}

export class CreateOrderDto extends CreationType(CreateOrder) {}
