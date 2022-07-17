import { Module } from '@nestjs/common';
import { CourseRatingsService } from './course-ratings.service';
import { CourseRatingsController } from './course-ratings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseRating } from './entities/course-rating.entity';
import { CoursesModule } from 'src/courses/courses.module';
import { UsersModule } from 'src/users/users.module';
import { CourseRatingsUtil } from './course-ratings.util';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseRating]),
    CoursesModule,
    UsersModule,
  ],
  controllers: [CourseRatingsController],
  providers: [CourseRatingsService, CourseRatingsUtil],
})
export class CourseRatingsModule {}
