import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { UpdationType } from 'src/commons/dtos';
import { EVideoProcessingStatus } from 'src/commons/enums';
import { TCreateLesson } from './create-lesson.dto';

export class AUpdateLessonDto extends UpdationType(
  PartialType(OmitType(TCreateLesson, ['coursePartId'])),
) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(EVideoProcessingStatus)
  processingStatus?: EVideoProcessingStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  videoURL?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  duration?: number;
}

export class AUpdateLessonVideoDto {}
