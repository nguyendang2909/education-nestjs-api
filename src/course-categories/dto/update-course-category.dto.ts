import { PartialType } from '@nestjs/swagger';
import { UpdationType } from 'src/commons/dtos';
import { CreateCourseCategory } from './create-course-category.dto';

export class UpdateCourseCategoryDto extends UpdationType(
  PartialType(CreateCourseCategory),
) {}
