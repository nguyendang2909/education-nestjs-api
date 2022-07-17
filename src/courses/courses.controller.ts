import { Controller, Get, Param, Query, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsAllowPublic, IsPublic, UserId } from 'src/commons/decorators';
import { CoursesService } from './courses.service';
import { FindAllCoursesDto, FindManyCourseDto } from './dto/find-course.dto';
import { ParamsWithId } from 'src/commons/dtos';
import { GetCourseStreamVideoDto } from './dto/get-course-stream-video.dto';
import { Request, Response } from 'express';

@Controller('courses')
@ApiTags('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @IsAllowPublic()
  async findMany(
    @Query() findManyCourseDto: FindManyCourseDto,
    @UserId() userId?: number,
  ) {
    return {
      type: 'courses',
      data: await this.coursesService.findMany(findManyCourseDto, userId),
    };
  }

  @Get('/count')
  @IsAllowPublic()
  async count(
    @Query() findAllCoursesDto: FindAllCoursesDto,
    @UserId() userId?: number,
  ) {
    return {
      type: 'countCourses',
      data: await this.coursesService.count(findAllCoursesDto, userId),
    };
  }

  @Get('/order-item/:id')
  async findOrderItemById(
    @Param() params: ParamsWithId,
    @UserId() userId: number,
  ) {
    return {
      type: 'courseOrderItem',
      data: await this.coursesService.findOrderItemById(+params.id, userId),
    };
  }

  // @Get('/cart/:id')
  // async findCartById(@Param() params: ParamsWithId, @UserId() userId: number) {
  //   return {
  //     type: 'courseCart',
  //     data: await this.coursesService.findCartById(+params.id, userId),
  //   };
  // }

  @Get('/learn/:id')
  async learnById(@Param() params: ParamsWithId, @UserId() userId: number) {
    return {
      type: 'course',
      data: await this.coursesService.learnOrFailById(+params.id, userId),
    };
  }

  @Get('/video/:id')
  @IsPublic()
  async streamVideo(
    @Param() params: ParamsWithId,
    @Query() getStreamVideoDto: GetCourseStreamVideoDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return await this.coursesService.streamVideo(
      +params.id,
      getStreamVideoDto,
      req,
      res,
    );
  }

  @Get(':id')
  @IsPublic()
  async findOneOrFailById(@Param() params: ParamsWithId) {
    return {
      type: 'course',
      data: await this.coursesService.findOneOrFailById(+params.id),
    };
  }
}
