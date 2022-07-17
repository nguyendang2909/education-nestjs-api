import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateActivationCodeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber({}, { each: true })
  courseId: number;
}
