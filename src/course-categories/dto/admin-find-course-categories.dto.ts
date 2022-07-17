import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBooleanString, IsEnum, IsOptional, IsString } from 'class-validator';
import {
  AFindAllDto,
  AFindManyType,
  FindOneConditions,
} from 'src/commons/dtos';
import { ESortDirection } from 'src/commons/enums';

export class AFindAllCourseCategoriesDto extends AFindAllDto {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBooleanString()
  countCourses?: 'true' | 'false';
}

export class AFindManyCourseCategoriesDto extends AFindManyType(
  AFindAllCourseCategoriesDto,
) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(ESortDirection)
  sortName: ESortDirection;
}

export class AFindOneCourseCategoryConditions extends FindOneConditions {}
