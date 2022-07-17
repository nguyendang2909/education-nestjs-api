import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { FindOneConditions } from 'src/commons/dtos';

export class FindCurrentUserConditions extends FindOneConditions {}

export class FindOneUserConditions {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  facebookId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  googleEmail?: string;
}

export class FindAllUsersConditions {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}

// export class FindManyUsersDto extends IntersectionType(
//   FindAllUsersDto,
//   FindManyDto,
// ) {}
