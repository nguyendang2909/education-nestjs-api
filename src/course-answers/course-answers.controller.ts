import { Controller, Post, Body, Param, Delete } from '@nestjs/common';
import { UserId } from 'src/commons/decorators';
import { ParamsWithId } from 'src/commons/dtos';
import { CourseAnswersService } from './course-answers.service';
import { CreateCourseAnswerDto } from './dto/create-course-answer.dto';

@Controller('course-answers')
export class CourseAnswersController {
  constructor(private readonly courseAnswersService: CourseAnswersService) {}

  @Post()
  async create(
    @Body() createCourseAnswerDto: CreateCourseAnswerDto,
    @UserId() userId: number,
  ) {
    return {
      type: 'createCourseAnswer',
      data: await this.courseAnswersService.create(
        createCourseAnswerDto,
        userId,
      ),
    };
  }

  @Delete(':id')
  async remove(@Param() params: ParamsWithId, @UserId() userId: number) {
    return {
      type: 'removeCourseAnswer',
      data: await this.courseAnswersService.remove(+params.id, userId),
    };
  }
}
