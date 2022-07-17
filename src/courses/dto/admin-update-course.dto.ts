import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ActiveDto, UpdationType } from 'src/commons/dtos';
import { EVideoProcessingStatus } from 'src/commons/enums';
import { ECoursePublish } from '../courses.type';

export class AUpdateCourse extends ActiveDto {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  // @ApiPropertyOptional({ type: Number })
  // @IsOptional()
  // @IsNumber()
  // courseCategoryId?: number;

  @ApiPropertyOptional({ type: Number, isArray: true })
  @IsOptional()
  @IsNumber()
  courseSubcategoryId?: number;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  subTitle?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  introductionVideoURL?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  about?: string;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  // @IsNumber({allowNaN: true})
  promotionPrice?: number;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  output?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsBoolean()
  certificate?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(ECoursePublish)
  publish?: ECoursePublish;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(EVideoProcessingStatus)
  introductionVideoProcessingStatus: EVideoProcessingStatus;
}

export class AUpdateCourseDto extends UpdationType(AUpdateCourse) {}
