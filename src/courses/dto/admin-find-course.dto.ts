import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsBooleanString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { FindManyType } from 'src/commons/dtos';
import { ECoursePublish } from '../courses.type';

export class AFindOneCourseConditions {
  @ApiPropertyOptional()
  @IsNotEmpty()
  @IsNumber()
  id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AFindAllCoursesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  courseSubcategoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  courseCategoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(ECoursePublish)
  publish?: ECoursePublish;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  commonPrice?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBooleanString()
  isActive: string;
}

export class AFindManyCourseDto extends FindManyType(AFindAllCoursesDto) {}
