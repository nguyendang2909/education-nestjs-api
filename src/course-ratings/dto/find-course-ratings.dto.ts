import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { FindManyType } from 'src/commons/dtos';

export class FindOneCourseRatingConditions {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  courseId?: string | number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string | number;
}

export class FindAllCourseRatingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rating?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  teacherId?: string;
}

export class FindManyCourseRatingDto extends FindManyType(
  FindAllCourseRatingDto,
) {}
