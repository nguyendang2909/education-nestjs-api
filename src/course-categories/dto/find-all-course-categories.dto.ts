import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBooleanString, IsOptional, IsString } from 'class-validator';

// export class FindAll

export class FindAllCourseCategoriesDto {
  // @ApiPropertyOptional({ type: String })
  // @IsOptional()
  // @IsString()
  // orderPosition?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBooleanString()
  countCourses?: 'true' | 'false';

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  @IsBooleanString()
  loadMenu?: string;
}

export class FindManyCourseCategoriesDto extends FindAllCourseCategoriesDto {}
