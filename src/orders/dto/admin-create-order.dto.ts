import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { CreationType } from 'src/commons/dtos';
import { EOrderStatus, EPaymentMethod } from '../orders.enum';

export class ACreateOrder {
  @ApiProperty({ enum: EPaymentMethod })
  @IsNotEmpty()
  @IsEnum(EPaymentMethod)
  paymentMethod: EPaymentMethod;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber({}, { each: true })
  cartId: number | number[];

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(EOrderStatus)
  status?: EOrderStatus;
}

export class ACreateOrderDto extends CreationType(ACreateOrder) {}
