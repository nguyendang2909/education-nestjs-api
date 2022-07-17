import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
} from 'class-validator';
import { FindManyType } from 'src/commons/dtos';

export class TFindAllCourseQuestionsDto {
  @ApiProperty()
  @IsOptional()
  @IsNumberString()
  courseId?: string;
}

export class TFindManyCourseQuestionsDto extends FindManyType(
  TFindAllCourseQuestionsDto,
) {}

export class TFindOneCourseQuestionConditions {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  id?: number;
}
