import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { CreateDto } from 'src/commons/dtos';

export class ACreateCartDto extends CreateDto {
  @IsNotEmpty()
  @IsNumber()
  courseId: number;

  @IsOptional()
  @IsNumber()
  userId: number;
}
