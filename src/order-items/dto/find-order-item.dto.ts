import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsNumberString, IsOptional } from 'class-validator';
import { FindAllDto, FindOneConditions } from 'src/commons/dtos';
import { EOrderStatus } from 'src/orders/orders.enum';

export class FindAllOrderItemsDto extends FindAllDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  courseId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  userId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  orderId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(EOrderStatus)
  orderStatus?: EOrderStatus;
}

export class FindManyPurchaseDto extends FindAllOrderItemsDto {}

export class FindOneOrderItemConditions extends PartialType(FindOneConditions) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(EOrderStatus)
  orderStatus?: EOrderStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  courseId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  userId?: number;
}
