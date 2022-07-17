import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsNumberString, IsOptional } from 'class-validator';
import { FindManyType } from 'src/commons/dtos';

export class FindOneCartDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  courseId?: number;
}
export class FindOneCartConditions extends FindOneCartDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  id?: number;
}

export class FindAllCartsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString({}, { each: true })
  courseId?: string | string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString({}, { each: true })
  id?: string | string[];
}

export class FindManyCartsDto extends FindManyType(FindAllCartsDto) {}
