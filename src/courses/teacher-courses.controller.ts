import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseInterceptors,
  BadRequestException,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { RequireRoles, User, UserId } from 'src/commons/decorators';
import { MAX_UPLOAD_FILE_SIZE, MAX_UPLOAD_VIDEO_FILE_SIZE } from 'src/config';
import { ERole } from 'src/users/users.enum';
import { TCreateCourseDto } from './dto/teacher-create-course.dto';
import {
  TUpdateCourseDto,
  TUpdateCourseImageDto,
  TUpdateCourseVideoDto,
} from './dto/teacher-update-course.dto';
import { UserWithoutPassword } from 'src/users/users.type';
import { ParamsWithId } from 'src/commons/dtos';
import { TeacherCoursesService } from './teacher-courses.service';
import {
  TFindAllCoursesDto,
  TFindManyCourseDto,
} from './dto/teacher-find-course.dto';
import { diskStorage } from 'multer';
import { FileManagerService } from 'src/file-manager/file-manager.service';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { Request, Response } from 'express';
import { TGetCourseStreamVideoDto } from './dto/teacher-get-course-stream-video.dto';

@Controller('teacher/courses')
@ApiTags('teachers/courses')
export class TeacherCoursesController {
  constructor(
    private readonly teacherCoursesService: TeacherCoursesService,
    private readonly fileManagerService: FileManagerService,
  ) {}

  @Post()
  @RequireRoles([ERole.Teacher, ERole.Admin])
  async create(
    @Body() createCourseDto: TCreateCourseDto,
    @UserId() userId: number,
  ) {
    return {
      type: 'createCourse',
      data: await this.teacherCoursesService.create(createCourseDto, userId),
    };
  }

  @Get()
  @RequireRoles([ERole.Teacher, ERole.Admin])
  async findMany(
    @Query() findManyCourseDto: TFindManyCourseDto,
    @UserId() userId: number,
  ) {
    return {
      type: 'courses',
      data: await this.teacherCoursesService.findMany(
        findManyCourseDto,
        userId,
      ),
    };
  }

  @Get('/count')
  @RequireRoles([ERole.Teacher, ERole.Admin])
  async count(
    @Query() findAllCoursesDto: TFindAllCoursesDto,
    @UserId() userId: number,
  ) {
    return {
      type: 'countCourses',
      data: await this.teacherCoursesService.count(findAllCoursesDto, userId),
    };
  }

  @Get('/video/:id')
  async streamVideo(
    @Param() params: ParamsWithId,
    @Query() getStreamVideoDto: TGetCourseStreamVideoDto,
    @Req() req: Request,
    @Res() res: Response,
    @UserId() userId: number,
  ) {
    return await this.teacherCoursesService.streamVideo(
      +params.id,
      userId,
      getStreamVideoDto,
      req,
      res,
    );
  }

  @Get(':id')
  @RequireRoles([ERole.Teacher, ERole.Admin])
  async findOneOrFailById(
    @Param() params: ParamsWithId,
    @UserId() userId: number,
  ) {
    return {
      type: 'course',
      data: await this.teacherCoursesService.findOneOrFailById(
        +params.id,
        userId,
      ),
    };
  }

  @Patch('/video/:id')
  @RequireRoles([ERole.Teacher, ERole.Admin])
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: MAX_UPLOAD_VIDEO_FILE_SIZE,
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.includes('video')) {
          req.fileValidationError = 'goes wrong on the mimetype';

          return cb(
            new BadRequestException('File không đúng định dạng video'),
            false,
          );
        }
        cb(null, true);
      },
      storage: diskStorage({
        destination: './temp',
        filename: (req, file, cb) => {
          const uniqueFilename = `${uuidv4()}${path.extname(
            file.originalname,
          )}`;

          cb(null, uniqueFilename);
        },
      }),
    }),
  )
  async updateVideo(
    @Param() params: ParamsWithId,
    @UserId() userId: number,
    @Body() tUpdateCourseVideoDto: TUpdateCourseVideoDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Cần chọn video');
    }

    return {
      type: 'updateCourse',
      data: await this.teacherCoursesService.updateVideo(
        +params.id,
        userId,
        tUpdateCourseVideoDto,
        file,
      ),
    };
  }

  @Patch('/image/:id')
  @RequireRoles([ERole.Teacher, ERole.Admin])
  @UseInterceptors(
    FileInterceptor('file', {
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
  async updateImage(
    @Param() params: ParamsWithId,
    @UserId() userId: number,
    @Body() tUpdateCourseImageDto: TUpdateCourseImageDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Cần chọn ảnh');
    }

    if (!tUpdateCourseImageDto.documentType) {
      throw new BadRequestException('Cần chọn loại ảnh');
    }

    return {
      type: 'updateCourse',
      data: await this.teacherCoursesService.updateImage(
        +params.id,
        userId,
        tUpdateCourseImageDto,
        file,
      ),
    };
  }

  @Patch(':id')
  @RequireRoles([ERole.Teacher, ERole.Admin])
  async update(
    @Param() params: ParamsWithId,
    @UserId() userId: number,
    @Body() tUpdateCourseDto: TUpdateCourseDto,
  ) {
    return {
      type: 'updateCourse',
      data: await this.teacherCoursesService.update(
        +params.id,
        userId,
        tUpdateCourseDto,
      ),
    };
  }

  @Delete(':id')
  @RequireRoles([ERole.Teacher, ERole.Admin])
  async remove(
    @Param() params: ParamsWithId,
    @User() user: UserWithoutPassword,
  ) {
    return {
      type: 'removeCourse',
      data: await this.teacherCoursesService.remove(+params.id, user),
    };
  }
}
