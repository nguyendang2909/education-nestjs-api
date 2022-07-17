import { Module } from '@nestjs/common';
import { CourseCategoriesService } from './course-categories.service';
import { CourseCategoriesController } from './course-categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseCategory } from './entities/course-category.entity';
import { AdminCourseCategoriesService } from './admin-course-categories.service';
import { AdminCourseCategoriesController } from './admin-course-categories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CourseCategory])],
  controllers: [CourseCategoriesController, AdminCourseCategoriesController],
  providers: [CourseCategoriesService, AdminCourseCategoriesService],
})
export class CourseCategoriesModule {}
