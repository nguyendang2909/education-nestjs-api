import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  UseInterceptors,
  BadRequestException,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { User, UserId } from 'src/commons/decorators';
import { UpdateCurrentUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { MAX_UPLOAD_FILE_SIZE } from 'src/config';
import { UserWithoutPassword } from './users.type';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return {
      type: 'createUser',
      data: await this.usersService.create(createUserDto),
    };
  }

  @Get('current')
  getCurrent(@User() user: UserWithoutPassword) {
    return {
      type: 'currentUser',
      data: user,
    };
  }

  @Patch('/current')
  async updateCurrent(
    @Body() updateUserDto: UpdateCurrentUserDto,
    @UserId() userId: number,
  ) {
    return {
      type: 'updateUser',
      data: await this.usersService.updateCurrent(updateUserDto, userId),
    };
  }

  @Patch('/current/avatar')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: MAX_UPLOAD_FILE_SIZE,
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.includes('image')) {
          req.fileValidationError = 'goes wrong on the mimetype';

          return cb(
            new BadRequestException('File không đúng định dạng ảnh'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async updateAvatar(
    @UploadedFile() file: Express.Multer.File,
    @User() user: UserWithoutPassword,
  ) {
    return {
      type: 'updateAvatar',
      data: await this.usersService.updateCurrentAvatar(file, user),
    };
  }
}
