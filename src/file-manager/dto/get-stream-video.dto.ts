import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetStreamVideoDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  path: string;
}
