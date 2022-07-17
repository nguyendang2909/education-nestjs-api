import { Module } from '@nestjs/common';
import { CourseActiveCodesService } from './course-active-codes.service';
import { CourseActiveCodesController } from './course-active-codes.controller';

@Module({
  controllers: [CourseActiveCodesController],
  providers: [CourseActiveCodesService],
})
export class CourseActiveCodesModule {}
