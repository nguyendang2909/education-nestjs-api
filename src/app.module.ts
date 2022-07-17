import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import path from 'path';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CoursesModule } from './courses/courses.module';
import { CourseSubcategoriesModule } from './course-subcategories/course-subcategories.module';
import { CourseCategoriesModule } from './course-categories/course-categories.module';
import { RoleGuard } from './middlewares/role.guard';
import { CoursePartsModule } from './course-parts/course-parts.module';
import { FileManagerModule } from './file-manager/file-manager.module';
import { LessonsModule } from './lessons/lessons.module';
import { CartsModule } from './carts/carts.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import winston from 'winston';
import { TeachersModule } from './teachers/teachers.module';
import { CourseRatingsModule } from './course-ratings/course-ratings.module';
import { CourseQuestionsModule } from './course-questions/course-questions.module';
import { CourseAnswersModule } from './course-answers/course-answers.module';
import { SchedulesModule } from './schedules/schedules.module';
import { CourseActiveCodesModule } from './course-active-codes/course-active-codes.module';
import { OrdersModule } from './orders/orders.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { ActivationCodesModule } from './activation-codes/activation-codes.module';
import { BannersModule } from './banners/banners.module';
import { OrderItemsModule } from './order-items/order-items.module';
import { PaymentsModule } from './payments/payments.module';
import mg from 'nodemailer-mailgun-transport';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike('leslei', {
              prettyPrint: true,
            }),
          ),
        }),
        new winston.transports.File({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike('leslei', {
              prettyPrint: true,
            }),
          ),
          dirname: path.join(__dirname, './../log/'),
          filename: 'info.log',
          level: 'info',
        }),
        new winston.transports.File({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike('leslei', {
              prettyPrint: true,
            }),
          ),
          dirname: path.join(__dirname, './../log/'),
          filename: 'warning.log',
          level: 'warning',
        }),
        new winston.transports.File({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike('leslei', {
              prettyPrint: true,
            }),
          ),
          dirname: path.join(__dirname, './../log/'),
          filename: 'error.log',
          level: 'error',
        }),
        // other transports...
      ],
      // other options
    }),
    ThrottlerModule.forRoot({ ttl: 10, limit: 100 }),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'public'),
      serveRoot: '/public',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true,
      // logging: true,
    }),
    MailerModule.forRoot({
      // transport: {
      //   service: 'mailgun',
      //   auth: {
      //     user: 'sandbox473af01c5d984e55ad38e791aaa73fc4.mailgun.org',
      //     pass: '5e7fba0f-6ef660ba',
      //   },
      // },
      transport: mg({
        auth: {
          api_key: process.env.NODE_MAILER_API_KEY,
          domain: process.env.NODE_MAILER_DOMAIN,
        },
      }),
      defaults: {
        from: '"Leslei" <admin@leslei.com>',
      },
      template: {
        dir: __dirname + '/templates',
        adapter: new PugAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    AuthModule,
    CourseCategoriesModule,
    CourseSubcategoriesModule,
    CoursesModule,
    CoursePartsModule,
    LessonsModule,
    UsersModule,
    FileManagerModule,
    CartsModule,
    TeachersModule,
    CourseRatingsModule,
    CourseQuestionsModule,
    CourseAnswersModule,
    SchedulesModule,
    CourseActiveCodesModule,
    OrdersModule,
    ActivationCodesModule,
    BannersModule,
    OrderItemsModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: RoleGuard },
  ],
})
export class AppModule {}
