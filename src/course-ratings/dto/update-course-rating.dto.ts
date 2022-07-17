import { PartialType } from '@nestjs/swagger';
import { UpdationType } from 'src/commons/dtos';
import { CreateCourseRating } from './create-course-rating.dto';

export class UpdateCourseRatingDto extends UpdationType(
  PartialType(CreateCourseRating),
) {}
