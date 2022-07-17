import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { CreationType } from 'src/commons/dtos';

export class ACreateCourseSubcategory {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  name: string;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  courseCategoryId: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  orderPosition?: number;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  icon?: string;
}

export class CreateCourseSubcategoryDto extends CreationType(
  ACreateCourseSubcategory,
) {}
