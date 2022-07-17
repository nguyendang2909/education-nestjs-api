import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserId } from 'src/commons/decorators';
import { ParamsWithId } from 'src/commons/dtos';
import { CourseQuestionsService } from './course-questions.service';
import { CreateCourseQuestionDto } from './dto/create-course-question.dto';
import {
  FindAllCourseQuestionsConditions,
  FindManyCourseQuestionsDto,
} from './dto/find-course-question.dto';

@Controller('course-questions')
@ApiTags('course-questions')
export class CourseQuestionsController {
  constructor(
    private readonly courseQuestionsService: CourseQuestionsService,
  ) {}

  @Post()
  async create(
    @Body() createCourseQuestionDto: CreateCourseQuestionDto,
    @UserId() userId: number,
  ) {
    return {
      type: 'createCourseQuestion',
      data: await this.courseQuestionsService.create(
        createCourseQuestionDto,
        userId,
      ),
    };
  }

  @Get('')
  async findMany(
    @Query() findManyCourseQuestionsDto: FindManyCourseQuestionsDto,
    @UserId() userId: number,
  ) {
    return {
      type: 'courseQuestions',
      data: await this.courseQuestionsService.findMany(
        findManyCourseQuestionsDto,
        userId,
      ),
    };
  }

  @Get('/count')
  async count(
    @Query() findAllCourseQuestionsDto: FindAllCourseQuestionsConditions,
    @UserId() userId: number,
  ) {
    return {
      type: 'courseQuestions',
      data: await this.courseQuestionsService.count(
        findAllCourseQuestionsDto,
        userId,
      ),
    };
  }

  @Get(':id')
  async findOneById(@Param() params: ParamsWithId, @UserId() userId: number) {
    return {
      type: 'courseQuestion',
      data: await this.courseQuestionsService.findOneOrFailById(
        +params.id,
        userId,
      ),
    };
  }

  @Delete(':id')
  remove(@Param() params: ParamsWithId, @UserId() userId: number) {
    return {
      type: 'removeCourseQuestion',
      data: this.courseQuestionsService.remove(+params.id, userId),
    };
  }
}
