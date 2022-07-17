import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { PasswordDto } from 'src/users/dto/password.dto';

export class ChangeForgotPasswordDto extends PasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  authJwt: string;
}
