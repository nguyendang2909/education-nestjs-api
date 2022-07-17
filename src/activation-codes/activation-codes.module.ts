import { Module } from '@nestjs/common';
import { ActivationCodesService } from './admin-activation-codes.service';
import { ActivationCodesController } from './activation-codes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivationCode } from './entities/activation-code.entity';
import { CoursesModule } from 'src/courses/courses.module';

@Module({
  imports: [TypeOrmModule.forFeature([ActivationCode]), CoursesModule],
  controllers: [ActivationCodesController],
  providers: [ActivationCodesService],
})
export class ActivationCodesModule {}
