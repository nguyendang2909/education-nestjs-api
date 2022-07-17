import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateOrderItem {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  courseId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  orderId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  promotionPrice?: number;
}
