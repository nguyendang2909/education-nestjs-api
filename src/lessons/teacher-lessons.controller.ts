import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { TCreateLessonDto } from './dto/create-lesson.dto';
import {
  TUpdateLessonDto,
  TUpdateLessonVideoDto,
} from './dto/update-lesson.dto';
import { RequireRoles, UserId } from 'src/commons/decorators';
import { ApiTags } from '@nestjs/swagger';
import { ERole } from 'src/users/users.enum';
import { ParamsWithId } from 'src/commons/dtos';
import { TeacherLessonsService } from './teacher-lessons.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { MAX_UPLOAD_VIDEO_FILE_SIZE } from 'src/config';
import { diskStorage } from 'multer';
import { v4 } from 'uuid';
import path from 'path';
import { Request, Response } from 'express';
import { TGetLessonStreamVideoDto } from './dto/teacher-get-lesson-stream-video.dto';

@Controller('teacher/lessons')
@ApiTags('teachers/lessons')
export class TeacherLessonsController {
  constructor(private readonly teacherLessonsService: TeacherLessonsService) {}

  @Post()
  @RequireRoles([ERole.Teacher, ERole.Admin])
  async createOne(
    @Body() createLessonDto: TCreateLessonDto,
    @UserId() userId: number,
  ) {
    return {
      type: 'createLesson',
      data: await this.teacherLessonsService.create(createLessonDto, userId),
    };
  }

  @Get()
  @RequireRoles([ERole.Teacher, ERole.Admin])
  async findAll() {
    return {
      type: 'lessons',
      data: await this.teacherLessonsService.findAll(),
    };
  }

  @Get('/video/:id')
  async streamVideo(
    @Param() params: ParamsWithId,
    @Query() getStreamVideoDto: TGetLessonStreamVideoDto,
    @Req() req: Request,
    @Res() res: Response,
    @UserId() userId: number,
  ) {
    return await this.teacherLessonsService.streamVideo(
      +params.id,
      userId,
      getStreamVideoDto,
      req,
      res,
    );
  }

  @Get(':id')
  @RequireRoles([ERole.Teacher, ERole.Admin])
  async findOne(@Param() params: ParamsWithId, @UserId() userId: number) {
    return {
      type: 'lesson',
      data: await this.teacherLessonsService.findOneOrFailById(
        +params.id,
        userId,
      ),
    };
  }

  @Patch('/video/:id')
  @RequireRoles([ERole.Admin, ERole.Teacher])
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
          const uniqueFilename = `${v4()}${path.extname(file.originalname)}`;

          cb(null, uniqueFilename);
        },
      }),
    }),
  )
  async updateVideo(
    @Param() params: ParamsWithId,
    @Body() updateLessonVideoDto: TUpdateLessonVideoDto,
    @UserId() userId: number,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException();
    }

    return {
      type: 'updateLessonVideo',
      data: await this.teacherLessonsService.updateVideo(
        +params.id,
        userId,
        updateLessonVideoDto,
        file,
      ),
    };
  }

  @Patch(':id')
  @RequireRoles([ERole.Teacher, ERole.Admin])
  async update(
    @Param() params: ParamsWithId,
    @Body() updateLessonDto: TUpdateLessonDto,
    @UserId() userId: number,
  ) {
    return {
      type: 'updateLesson',
      data: await this.teacherLessonsService.update(
        +params.id,
        updateLessonDto,
        userId,
      ),
    };
  }

  @Delete(':id')
  @RequireRoles([ERole.Teacher, ERole.Admin])
  async remove(@Param() params: ParamsWithId, @UserId() userId: number) {
    return {
      type: 'removeLesson',
      data: await this.teacherLessonsService.remove(+params.id, userId),
    };
  }
}
