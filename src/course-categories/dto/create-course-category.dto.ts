import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { CreationType } from 'src/commons/dtos';

export class CreateCourseCategory {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  name: string;

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

export class CreateCourseCategoryDto extends CreationType(
  CreateCourseCategory,
) {}
