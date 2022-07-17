import { forwardRef, Module } from '@nestjs/common';
import { CoursePartsService } from './course-parts.service';
import { CoursePartsController } from './course-parts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursePart } from './entities/course-part.entity';
import { CoursesModule } from 'src/courses/courses.module';
import { TeacherCoursePartsService } from './teacher-course-parts.service';
import { TeacherCoursePartsController } from './teacher-course-parts.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CoursePart]),
    forwardRef(() => CoursesModule),
  ],
  exports: [CoursePartsService, TeacherCoursePartsService],
  controllers: [CoursePartsController, TeacherCoursePartsController],
  providers: [CoursePartsService, TeacherCoursePartsService],
})
export class CoursePartsModule {}
