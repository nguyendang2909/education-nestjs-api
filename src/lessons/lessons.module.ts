import { forwardRef, Module } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from './entities/lesson.entity';
import { CoursePartsModule } from 'src/course-parts/course-parts.module';
import { FileManagerModule } from 'src/file-manager/file-manager.module';
import { TeacherLessonsController } from './teacher-lessons.controller';
import { TeacherLessonsService } from './teacher-lessons.service';
import { SchedulesModule } from 'src/schedules/schedules.module';
import { AdminLessonsService } from './admin-lessons.service';
import { AdminLessonsController } from './admin-lessons.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lesson]),
    CoursePartsModule,
    FileManagerModule,
    forwardRef(() => SchedulesModule),
  ],
  exports: [AdminLessonsService],
  controllers: [
    LessonsController,
    TeacherLessonsController,
    AdminLessonsController,
  ],
  providers: [LessonsService, TeacherLessonsService, AdminLessonsService],
})
export class LessonsModule {}
