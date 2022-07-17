import { PartialType } from '@nestjs/swagger';
import { UpdationType } from 'src/commons/dtos';
import { CreateCourseQuestion } from './create-course-question.dto';

export class UpdateCourseQuestionDto extends UpdationType(
  PartialType(CreateCourseQuestion),
) {}
