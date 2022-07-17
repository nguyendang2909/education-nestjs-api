import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserId } from 'src/commons/decorators';
import { ParamsWithId } from 'src/commons/dtos';
import {} from './dto/find-course-question.dto';
import {
  TFindAllCourseQuestionsDto,
  TFindManyCourseQuestionsDto,
} from './dto/teacher-find-course-question.dto';
import { TeacherCourseQuestionsService } from './teacher-course-questions.service';

@Controller('teacher/course-questions')
@ApiTags('teacher/course-questions')
export class TeacherCourseQuestionsController {
  constructor(
    private readonly teacherCourseQuestionsService: TeacherCourseQuestionsService,
  ) {}

  @Get('')
  async findMany(
    @Query() tFindManyCourseQuestionsDto: TFindManyCourseQuestionsDto,
    @UserId() userId: number,
  ) {
    return {
      type: 'teacherCourseQuestions',
      data: await this.teacherCourseQuestionsService.findMany(
        tFindManyCourseQuestionsDto,
        userId,
      ),
    };
  }

  @Get('/count')
  async count(
    @Query() tFindAllCourseQuestionsDto: TFindAllCourseQuestionsDto,
    @UserId() userId: number,
  ) {
    return {
      type: 'teacherCountCourseQuestions',
      data: await this.teacherCourseQuestionsService.count(
        tFindAllCourseQuestionsDto,
        userId,
      ),
    };
  }

  @Get(':id')
  async findOneById(@Param() params: ParamsWithId, @UserId() userId: number) {
    return {
      type: 'courseQuestion',
      data: await this.teacherCourseQuestionsService.findOneOrFailById(
        +params.id,
        userId,
      ),
    };
  }

  // @Delete(':id')
  // remove(@Param() params: ParamsWithId, @UserId() userId: number) {
  //   return {
  //     type: 'removeCourseQuestion',
  //     data: this.courseQuestionsService.remove(+params.id, userId),
  //   };
  // }
}
