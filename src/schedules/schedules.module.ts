import { forwardRef, Module } from '@nestjs/common';
import { CoursesModule } from 'src/courses/courses.module';
import { FileManagerModule } from 'src/file-manager/file-manager.module';
import { LessonsModule } from 'src/lessons/lessons.module';
import { SchedulesService } from './schedules.service';

@Module({
  imports: [
    forwardRef(() => LessonsModule),
    forwardRef(() => CoursesModule),
    FileManagerModule,
  ],
  exports: [SchedulesService],
  providers: [SchedulesService],
})
export class SchedulesModule {}
