import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetS3UploadParamsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  filename: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  fileType: string;
}
