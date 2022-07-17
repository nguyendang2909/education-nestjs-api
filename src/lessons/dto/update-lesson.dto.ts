import { OmitType, PartialType } from '@nestjs/swagger';
import { UpdationType } from 'src/commons/dtos';
import { TCreateLesson } from './create-lesson.dto';

export class TUpdateLessonDto extends UpdationType(
  PartialType(OmitType(TCreateLesson, ['coursePartId'])),
) {}

export class TUpdateLessonVideoDto {}
