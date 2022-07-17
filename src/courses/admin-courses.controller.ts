import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequireRoles } from 'src/commons/decorators';
import { ERole } from 'src/users/users.enum';
import { ParamsWithId } from 'src/commons/dtos';
import { AdminCoursesService } from './admin-courses.service';
import {
  AFindAllCoursesDto,
  AFindManyCourseDto,
} from './dto/admin-find-course.dto';
import { AUpdateCourseDto } from './dto/admin-update-course.dto';

@Controller('admin/courses')
@ApiTags('admin/courses')
export class AdminCoursesController {
  constructor(private readonly adminCoursesService: AdminCoursesService) {}

  @Get()
  @RequireRoles([ERole.Admin])
  async findMany(@Query() aFindManyCourseDto: AFindManyCourseDto) {
    return {
      type: 'courses',
      data: await this.adminCoursesService.findMany(aFindManyCourseDto),
    };
  }

  @Get('/count')
  @RequireRoles([ERole.Admin])
  async count(@Query() afindAllCoursesDto: AFindAllCoursesDto) {
    return {
      type: 'countCourses',
      data: await this.adminCoursesService.count(afindAllCoursesDto),
    };
  }

  @Get(':id')
  @RequireRoles([ERole.Admin])
  async findOneOrFailById(@Param() params: ParamsWithId) {
    return {
      type: 'course',
      data: await this.adminCoursesService.findOneOrFailById(+params.id),
    };
  }

  @Patch(':id')
  @RequireRoles([ERole.Admin])
  async update(
    @Param() params: ParamsWithId,
    @Body() aUpdateCourseDto: AUpdateCourseDto,
  ) {
    return {
      type: 'updateCourse',
      data: await this.adminCoursesService.update(+params.id, aUpdateCourseDto),
    };
  }

  @Delete(':id')
  @RequireRoles([ERole.Teacher, ERole.Admin])
  async remove(@Param() params: ParamsWithId) {
    return {
      type: 'removeCourse',
      data: await this.adminCoursesService.remove(+params.id),
    };
  }
}
