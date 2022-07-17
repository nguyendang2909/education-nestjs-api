import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBooleanString,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { FindManyType, FindOneConditions } from 'src/commons/dtos';
import { EBooleanString } from 'src/commons/enums';

export class FindAllCoursesDto {
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
  @IsString()
  teacherId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  price?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  commonPrice?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBooleanString()
  purchase?: EBooleanString;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBooleanString()
  showCountQuestions?: 'true' | 'false';

  @ApiPropertyOptional()
  @IsOptional()
  @IsBooleanString()
  promotion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBooleanString()
  free?: string;

  // @ApiPropertyOptional()
  // @IsOptional()
  // @IsString()
  // sortOptions?: string;
}

export class FindManyCourseDto extends FindManyType(FindAllCoursesDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['newest', 'popularity', , 'relevant'])
  sortBy?: 'newest' | 'popularity' | 'relevant';
}

export class FindOneCourseConditions extends FindOneConditions {}
