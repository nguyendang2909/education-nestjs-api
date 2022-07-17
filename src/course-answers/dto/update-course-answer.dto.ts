import { PartialType } from '@nestjs/swagger';
import { CreateCourseAnswerDto } from './create-course-answer.dto';

export class UpdateCourseAnswerDto extends PartialType(CreateCourseAnswerDto) {}
