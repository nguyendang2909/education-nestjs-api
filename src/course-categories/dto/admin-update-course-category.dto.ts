import { PartialType } from '@nestjs/swagger';
import { AUpdationType } from 'src/commons/dtos';
import { CreateCourseCategory } from './create-course-category.dto';

export class AUpdateCourseCategoryDto extends AUpdationType(
  PartialType(CreateCourseCategory),
) {}
