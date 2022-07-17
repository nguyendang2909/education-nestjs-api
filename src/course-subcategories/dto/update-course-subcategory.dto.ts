import { PartialType, OmitType } from '@nestjs/swagger';
import { AUpdationType } from 'src/commons/dtos';
import { CreateCourseSubcategoryDto } from './create-course-subcategory.dto';

export class UpdateCourseSubcategoryDto extends AUpdationType(
  PartialType(CreateCourseSubcategoryDto),
) {}
