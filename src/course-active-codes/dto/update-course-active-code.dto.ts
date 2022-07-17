import { PartialType } from '@nestjs/swagger';
import { CreateCourseActiveCodeDto } from './create-course-active-code.dto';

export class UpdateCourseActiveCodeDto extends PartialType(
  CreateCourseActiveCodeDto,
) {}
