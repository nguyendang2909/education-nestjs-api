import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
} from 'class-validator';
import { FindManyType } from 'src/commons/dtos';

export class FindAllCourseQuestionsConditions {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  courseId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  userId?: string;
}

export class FindManyCourseQuestionsDto extends FindManyType(
  FindAllCourseQuestionsConditions,
) {
  // @ApiPropertyOptional()
  // @IsOptional()
  // @IsNumberString()
  // lastId: string;
}

export class FindOneCourseQuestionDto {}

export class FindOneCourseQuestionConditions extends FindOneCourseQuestionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  id?: number;
}
