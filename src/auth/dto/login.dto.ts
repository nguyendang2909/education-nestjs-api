import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { PasswordDto } from 'src/users/dto/password.dto';

export class LoginDto extends PasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  username: string;

  // @ApiProperty()
  // @IsNotEmpty()
  // @IsBoolean()
  // remember: boolean;
}
