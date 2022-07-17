import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { UpdationType } from 'src/commons/dtos';
import {
  ECourseImageType,
  ECoursePublish,
  ECourseVideoType,
} from '../courses.type';
import { TCreateCourse } from './teacher-create-course.dto';

export class TUpdateCourseDto extends UpdationType(
  PartialType(OmitType(TCreateCourse, ['courseCategoryId'])),
) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(ECoursePublish)
  publish?: ECoursePublish;
}

export class TUpdateCourseImageDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(ECourseImageType)
  documentType: ECourseImageType;
}

export class TUpdateCourseVideoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(ECourseVideoType)
  documentType: ECourseVideoType;
}

export type TUpdateImage = {
  type: 'cover' | 'banner';
};
