import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsDateString, IsNumberString, IsOptional } from 'class-validator';
import { FindAllDto, FindManyType, FindOneConditions } from 'src/commons/dtos';

export class TFindAllOrderItemsDto extends FindAllDto {
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
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class TFindManyOrderItemsDto extends FindManyType(
  TFindAllOrderItemsDto,
) {}

export class TFindOneOrderItemConditions extends PartialType(
  FindOneConditions,
) {}
