import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Patch,
  UseInterceptors,
  BadRequestException,
  UploadedFile,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { RequireRoles, UserId } from 'src/commons/decorators';
import { ERole } from './users.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { MAX_UPLOAD_FILE_SIZE } from 'src/config';
import { ParamsWithId } from 'src/commons/dtos';
import { AdminUsersService } from './admin-users.service';
import { AFindAllUsersDto, AFindManyUsersDto } from './dto/admin-find-user.dto';
import { AUpdateUserDto } from './dto/admin-update-user.dto';

@ApiTags('/admin/users')
@Controller('/admin/users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Post()
  @RequireRoles([ERole.Admin])
  async create(@Body() createUserDto: CreateUserDto) {
    return {
      type: 'createUser',
      data: await this.adminUsersService.create(createUserDto),
    };
  }

  @Get()
  @RequireRoles([ERole.Admin])
  async findMany(@Query() findManyUsersDto: AFindManyUsersDto) {
    return {
      type: 'users',
      data: await this.adminUsersService.findMany(findManyUsersDto),
    };
  }

  @Get('/count')
  @RequireRoles([ERole.Admin])
  async count(@Query() findAllUsersDto: AFindAllUsersDto) {
    return {
      type: 'countUsers',
      data: await this.adminUsersService.count(findAllUsersDto),
    };
  }

  @Get(':id')
  @RequireRoles([ERole.Admin])
  async findOneById(@Param() params: ParamsWithId) {
    return {
      type: 'user',
      data: await this.adminUsersService.findOneOrFailById(+params.id),
    };
  }

  @Patch('/:id')
  @RequireRoles([ERole.Admin])
  async update(
    @Param() params: ParamsWithId,
    @Body() updateUserDto: AUpdateUserDto,
  ) {
    return {
      type: 'updateUser',
      data: await this.adminUsersService.update(+params.id, updateUserDto),
    };
  }

  @Patch('/avatar')
  @RequireRoles([ERole.Admin])
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
    @Param() params: ParamsWithId,
    @UploadedFile() file: Express.Multer.File,
    @UserId() userId: number,
  ) {
    return {
      type: 'updateAvatar',
      data: await this.adminUsersService.updateAvatar(+params.id, file, userId),
    };
  }
}
