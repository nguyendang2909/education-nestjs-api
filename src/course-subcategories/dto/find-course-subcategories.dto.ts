import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { FindOneConditions } from 'src/commons/dtos';

export class FindAllCourseSubcategoriesDto {
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

export class FindOneCourseSubcategoryConditions extends FindOneConditions {}
