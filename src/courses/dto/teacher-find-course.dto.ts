import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { FindManyType } from 'src/commons/dtos';
import { ESortDirection } from 'src/commons/enums';
import { ECoursePublish } from '../courses.type';

export class TFindOneCourseDto {}

export class TFindOneCourseConditions extends TFindOneCourseDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  id?: number;
}

export class TFindAllCoursesDto {
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
  @IsEnum(ESortDirection)
  sortName?: ESortDirection;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(ESortDirection)
  sortCreatedAt?: ESortDirection;
}

export class TFindManyCourseDto extends FindManyType(TFindAllCoursesDto) {}
