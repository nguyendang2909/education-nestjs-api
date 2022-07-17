import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { EPaymentMethod } from '../orders.enum';

export class VerifyOrderDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty({ enum: EPaymentMethod })
  @IsNotEmpty()
  @IsEnum(EPaymentMethod)
  paymentMethod: EPaymentMethod;
}
