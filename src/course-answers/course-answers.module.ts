import { forwardRef, Module } from '@nestjs/common';
import { CourseAnswersService } from './course-answers.service';
import { CourseAnswersController } from './course-answers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseAnswer } from './entities/course-answer.entity';
import { CourseQuestionsModule } from 'src/course-questions/course-questions.module';
import { UsersModule } from 'src/users/users.module';
import { CourseAnswersUtil } from './course-answers.util';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseAnswer]),
    UsersModule,
    forwardRef(() => CourseQuestionsModule),
  ],
  exports: [CourseAnswersService, CourseAnswersUtil],
  controllers: [CourseAnswersController],
  providers: [CourseAnswersService, CourseAnswersUtil],
})
export class CourseAnswersModule {}
