import { Type } from '@nestjs/common';
import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
} from '@nestjs/swagger';
import {
  IsBoolean,
  IsBooleanString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { EBooleanString, ESortDirection } from './enums';

export class UpdateDto {
  @IsNotEmpty()
  @IsNumber()
  updatedBy: number;
}

export class AUpdateDto extends UpdateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateDto extends UpdateDto {
  @IsNotEmpty()
  @IsNumber()
  createdBy: number;
}

export const UpdationType = <A>(obj: Type<A>) => {
  return IntersectionType(obj, UpdateDto);
};

export const AUpdationType = <A>(obj: Type<A>) => {
  return IntersectionType(obj, AUpdateDto);
};

export const UpdateionPartialType = <A>(obj: Type<A>) => {
  return IntersectionType(obj, UpdateDto);
};

export const CreationType = <A>(obj: Type<A>) => {
  return IntersectionType(obj, CreateDto);
};

export const FindManyType = <A>(obj: Type<A>) => {
  return IntersectionType(obj, FindManyDto);
};

export class FindManyDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currentPage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pageSize?: string;
}

export class ParamsWithId {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString({}, { message: 'Id đối tượng không đúng' })
  id: string;
}

export class ActiveDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export const ActivationType = <A>(obj: Type<A>) => {
  return IntersectionType(obj, ActiveDto);
};

export class FindOneConditions {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  id: number;
}

export class FindAllDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString({}, { each: true })
  id?: string | string[];
}

export class AFindAllDto extends FindAllDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBooleanString()
  isActive?: EBooleanString;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  updatedBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  createdBy?: string;
}

export class AFindManyDto extends FindManyDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(ESortDirection)
  sortCreatedAt?: ESortDirection;
}

export const AFindManyType = <A>(obj: Type<A>) => {
  return IntersectionType(obj, AFindManyDto);
};
