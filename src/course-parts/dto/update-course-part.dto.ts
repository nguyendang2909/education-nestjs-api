import { OmitType, PartialType } from '@nestjs/swagger';
import { UpdationType } from 'src/commons/dtos';
import { TCreateCoursePart } from './create-course-part.dto';

export class TUpdateCoursePartDto extends UpdationType(
  PartialType(OmitType(TCreateCoursePart, ['courseId'])),
) {}
