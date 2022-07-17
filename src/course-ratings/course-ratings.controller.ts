import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { IsPublic, UserId } from 'src/commons/decorators';
import { ParamsWithId } from 'src/commons/dtos';
import { CourseRatingsService } from './course-ratings.service';
import { CreateCourseRatingDto } from './dto/create-course-rating.dto';
import {
  FindAllCourseRatingDto,
  FindManyCourseRatingDto,
} from './dto/find-course-ratings.dto';

@Controller('course-ratings')
export class CourseRatingsController {
  constructor(private readonly courseRatingsService: CourseRatingsService) {}

  @Post()
  async create(
    @Body() createCourseRatingDto: CreateCourseRatingDto,
    @UserId() userId: number,
  ) {
    return {
      type: 'createCourseRating',
      data: await this.courseRatingsService.create(
        createCourseRatingDto,
        userId,
      ),
    };
  }

  @Get()
  @IsPublic()
  async findMany(@Query() findManyCourseRatingDto: FindManyCourseRatingDto) {
    return {
      type: 'courseRatings',
      data: await this.courseRatingsService.findMany(findManyCourseRatingDto),
    };
  }

  @Get('/count')
  @IsPublic()
  async count(@Query() findAllCourseRatingDto: FindAllCourseRatingDto) {
    return {
      type: 'countCourseRating',
      data: await this.courseRatingsService.count(findAllCourseRatingDto),
    };
  }

  @Get(':id')
  @IsPublic()
  findOneOrFailById(@Param() params: ParamsWithId) {
    return {
      type: 'courseRating',
      data: this.courseRatingsService.findOneOrFailById(+params.id),
    };
  }
}
