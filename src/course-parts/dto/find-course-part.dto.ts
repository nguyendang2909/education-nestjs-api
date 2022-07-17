import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class FindAllCoursePartDto {
  // @ApiPropertyOptional()
  // @IsOptional()
  // @IsString()
  // name?: string;

  // @ApiPropertyOptional()
  // @IsOptional()
  // @IsNumberString()
  // courseId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  id?: number;
}
