import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { AFindAllDto, FindManyType } from 'src/commons/dtos';

export class AFindOneCartDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  courseId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  userId?: number;
}
export class AFindOneCartConditions extends AFindOneCartDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  id?: number;
}

export class AFindAllCartsDto extends AFindAllDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  courseId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  userId?: number;
}

export class AFindManyCartsDto extends FindManyType(AFindAllCartsDto) {}
