import { Controller, Get, Param, Query } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { IsAllowPublic } from 'src/commons/decorators';
import { FindManyTeachersDto } from './dto/find-teacher.dto';
import { ParamsWithId } from 'src/commons/dtos';

@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get()
  @IsAllowPublic()
  async findMany(@Query() findManyTeachersDto: FindManyTeachersDto) {
    return {
      type: 'teachers',
      data: await this.teachersService.findMany(findManyTeachersDto),
    };
  }

  @Get(':id')
  @IsAllowPublic()
  async findOne(@Param() params: ParamsWithId) {
    return {
      type: 'teacher',
      data: await this.teachersService.findOneOrFailById(+params.id),
    };
  }
}
