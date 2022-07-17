import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { CreationType } from 'src/commons/dtos';

export class TCreateCoursePart {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  name: string;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  orderPosition?: number;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  courseId: number;
}

export class TCreateCoursePartDto extends CreationType(TCreateCoursePart) {}
