import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FileManagerModule } from 'src/file-manager/file-manager.module';
import { AdminUsersService } from './admin-users.service';
import { AdminUsersController } from './admin-users.controller';
import { UsersUtil } from './users.util';

@Module({
  imports: [TypeOrmModule.forFeature([User]), FileManagerModule],
  exports: [UsersService, UsersUtil],
  controllers: [UsersController, AdminUsersController],
  providers: [UsersService, UsersUtil, AdminUsersService],
})
export class UsersModule {}
