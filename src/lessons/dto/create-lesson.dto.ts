import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { CreationType } from 'src/commons/dtos';
import { LESSON_NAME_MAX_LENGTH } from '../lessons.config';
import { ELessonType } from '../lessons.enum';

export class TCreateLesson {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(LESSON_NAME_MAX_LENGTH)
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  coursePartId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(ELessonType)
  type: ELessonType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  trial?: boolean;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  orderPosition?: number;
}

export class TCreateLessonDto extends CreationType(TCreateLesson) {}
