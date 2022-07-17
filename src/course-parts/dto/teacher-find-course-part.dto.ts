import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, IsOptional } from 'class-validator';
import { FindManyType } from 'src/commons/dtos';

export class TFindAllCoursePartsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  courseId?: string;
}

export class TFindManyCoursePartsDto extends FindManyType(
  TFindAllCoursePartsDto,
) {}
