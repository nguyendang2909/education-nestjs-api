import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AFindAllDto, AFindManyType } from 'src/commons/dtos';
import { ESortDirection } from 'src/commons/enums';

export class AFindAllCourseSubcategoriesDto extends AFindAllDto {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  orderPosition?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
  courseCategoryId?: string;
}

export class AFindManyCourseSubcategoriesDto extends AFindManyType(
  AFindAllCourseSubcategoriesDto,
) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(ESortDirection)
  sortOrderPosition?: ESortDirection;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(ESortDirection)
  sortName?: ESortDirection;
}
