import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequireRoles, UserId } from 'src/commons/decorators';
import { ParamsWithId } from 'src/commons/dtos';
import { ERole } from 'src/users/users.enum';
import { TCreateCoursePartDto } from './dto/create-course-part.dto';
import { TFindManyCoursePartsDto } from './dto/teacher-find-course-part.dto';
import { TUpdateCoursePartDto } from './dto/update-course-part.dto';
import { TeacherCoursePartsService } from './teacher-course-parts.service';

@Controller('teacher/course-parts')
@ApiTags('teachers/course-parts')
export class TeacherCoursePartsController {
  constructor(
    private readonly teacherCoursePartsService: TeacherCoursePartsService,
  ) {}

  @Post()
  @RequireRoles([ERole.Admin, ERole.Teacher])
  async create(
    @Body() createCoursePartDto: TCreateCoursePartDto,
    @UserId() userId: number,
  ) {
    return {
      type: 'createCoursePart',
      data: await this.teacherCoursePartsService.create(
        createCoursePartDto,
        userId,
      ),
    };
  }

  @Get('/')
  @RequireRoles([ERole.Admin, ERole.Teacher])
  async findMany(
    @Query() tFindManyCoursePartsDto: TFindManyCoursePartsDto,
    @UserId() userId: number,
  ) {
    return {
      type: 'courseParts',
      data: await this.teacherCoursePartsService.findMany(
        tFindManyCoursePartsDto,
        userId,
      ),
    };
  }

  @Get('/:id')
  @RequireRoles([ERole.Admin, ERole.Teacher])
  async findOneById(@Param() params: ParamsWithId, @UserId() userId: number) {
    return {
      type: 'coursePart',
      data: await this.teacherCoursePartsService.findOneOrFailById(
        +params.id,
        userId,
      ),
    };
  }

  @Patch(':id')
  @RequireRoles([ERole.Admin, ERole.Teacher])
  update(
    @Param() params: ParamsWithId,
    @Body() updateCoursePartDto: TUpdateCoursePartDto,
    @UserId() user: number,
  ) {
    return this.teacherCoursePartsService.updateOne(
      +params.id,
      updateCoursePartDto,
      user,
    );
  }

  @Delete(':id')
  @RequireRoles([ERole.Admin, ERole.Teacher])
  async remove(@Param() params: ParamsWithId, @UserId() userId: number) {
    return {
      type: 'removeCoursePart',
      data: await this.teacherCoursePartsService.removeOneOrFailById(
        +params.id,
        userId,
      ),
    };
  }
}
