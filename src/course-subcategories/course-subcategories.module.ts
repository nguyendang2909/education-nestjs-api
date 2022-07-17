import { Module } from '@nestjs/common';
import { CourseSubcategoriesService } from './course-subcategories.service';
import { CourseSubcategoriesController } from './course-subcategories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseSubcategory } from './entities/course-subcategory.entity';
import { AdminCourseSubcategoriesService } from './admin-course-subcategories.service';
import { AdminCourseSubcategoriesController } from './admin-course-subcategories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CourseSubcategory])],
  controllers: [
    CourseSubcategoriesController,
    AdminCourseSubcategoriesController,
  ],
  providers: [CourseSubcategoriesService, AdminCourseSubcategoriesService],
})
export class CourseSubcategoriesModule {}
