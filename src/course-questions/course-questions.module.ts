import { forwardRef, Module } from '@nestjs/common';
import { CourseQuestionsService } from './course-questions.service';
import { CourseQuestionsController } from './course-questions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseQuestion } from './entities/course-question.entity';
import { CoursesModule } from 'src/courses/courses.module';
import { TeacherCourseQuestionsController } from './teacher-course-questions.controller';
import { TeacherCourseQuestionsService } from './teacher-course-questions.service';
import { UsersModule } from 'src/users/users.module';
import { CourseAnswersModule } from 'src/course-answers/course-answers.module';
import { CourseQuestionsUtil } from './course-questions.util';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseQuestion]),
    CoursesModule,
    UsersModule,
    forwardRef(() => CourseAnswersModule),
  ],
  exports: [CourseQuestionsService, CourseQuestionsUtil],
  controllers: [CourseQuestionsController, TeacherCourseQuestionsController],
  providers: [
    CourseQuestionsUtil,
    CourseQuestionsService,
    TeacherCourseQuestionsService,
  ],
})
export class CourseQuestionsModule {}
