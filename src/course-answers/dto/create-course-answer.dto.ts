import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { CreationType } from 'src/commons/dtos';

export class CreateCourseAnswer {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  courseQuestionId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  content: string;
}

export class CreateCourseAnswerDto extends CreationType(CreateCourseAnswer) {}
