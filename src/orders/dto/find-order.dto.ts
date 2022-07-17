import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { FindAllDto, FindManyType, FindOneConditions } from 'src/commons/dtos';
import { EOrderStatus } from '../orders.enum';

export class FindOneOrderConditions extends FindOneConditions {}

export class FindAllOrdersDto extends FindAllDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(EOrderStatus)
  status?: EOrderStatus;
}

export class FindManyOrdersDto extends FindManyType(FindAllOrdersDto) {}
