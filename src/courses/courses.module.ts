import { forwardRef, Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { FileManagerModule } from 'src/file-manager/file-manager.module';
import { TeacherCoursesController } from './teacher-courses.controller';
import { TeacherCoursesService } from './teacher-courses.service';
import { AdminCoursesService } from './admin-courses.service';
import { AdminCoursesController } from './admin-courses.controller';
import { SchedulesModule } from 'src/schedules/schedules.module';
import { CoursesUtil } from './courses.util';
import { UsersModule } from 'src/users/users.module';
import { OrderItemsModule } from 'src/order-items/order-items.module';
import { CartsModule } from 'src/carts/carts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course]),
    FileManagerModule,
    UsersModule,
    forwardRef(() => SchedulesModule),
    forwardRef(() => CartsModule),
    OrderItemsModule,
  ],
  exports: [CoursesService, TeacherCoursesService, AdminCoursesService],
  controllers: [
    CoursesController,
    TeacherCoursesController,
    AdminCoursesController,
  ],
  providers: [
    CoursesUtil,
    CoursesService,
    TeacherCoursesService,
    AdminCoursesService,
  ],
})
export class CoursesModule {}
