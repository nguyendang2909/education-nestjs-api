import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { CreateDto } from 'src/commons/dtos';

export class CreateCartDto extends CreateDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  courseId: number;
}
