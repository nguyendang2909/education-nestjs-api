import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CreationType } from 'src/commons/dtos';

export class TCreateCourse {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  courseCategoryId: number;

  @ApiProperty({ type: Number, isArray: true })
  @IsNotEmpty()
  @IsNumber()
  courseSubcategoryId: number;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  subTitle?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  introductionVideoURL?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  about?: string;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  // @IsNumber({allowNaN: true})
  promotionPrice?: number;

  // @ApiPropertyOptional({ type: String })
  // @IsOptional()
  // @IsOnlyDate()
  // promotionStartTime?: string;

  // @ApiPropertyOptional({ type: String })
  // @IsOptional()
  // @IsOnlyDate()
  // promotionEndTime?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  output?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsBoolean()
  certificate?: boolean;
}

export class TCreateCourseDto extends CreationType(TCreateCourse) {}
