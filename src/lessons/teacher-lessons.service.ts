import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request, Response } from 'express';
import { EVideoProcessingStatus } from 'src/commons/enums';
import { handleFindOne, handleUpdateOne } from 'src/commons/record-handlers';
import {
  RABBITMQ_VIDEO_TRANSCODE_ROUTING_KEY,
  RABBITMQ_VIDEO_TRANSCODE_EXCHANGE,
} from 'src/config';
import { coursePartEntityName } from 'src/course-parts/entities/course-part.entity';
import { TeacherCoursePartsService } from 'src/course-parts/teacher-course-parts.service';
import { courseEntityName } from 'src/courses/entities/course.entity';
import { FileManagerService } from 'src/file-manager/file-manager.service';
import { SchedulesService } from 'src/schedules/schedules.service';
import { VideoTranscodePublishData } from 'src/schedules/schedules.type';
import { Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { TCreateLessonDto } from './dto/create-lesson.dto';
import { TGetLessonStreamVideoDto } from './dto/teacher-get-lesson-stream-video.dto';
import {
  TUpdateLessonDto,
  TUpdateLessonVideoDto,
} from './dto/update-lesson.dto';
import { Lesson, lessonEntityName } from './entities/lesson.entity';
import { ELessonType } from './lessons.enum';
import fs from 'fs';

@Injectable()
export class TeacherLessonsService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    private readonly teacherCoursePartsService: TeacherCoursePartsService,
    private readonly fileManagerService: FileManagerService,
    @Inject(forwardRef(() => SchedulesService))
    private readonly scheduleService: SchedulesService,
  ) {}

  async create(createLessonDto: TCreateLessonDto, userId: number) {
    const { coursePartId, ...createDto } = createLessonDto;

    const coursePart = await this.teacherCoursePartsService.findOneOrFailById(
      coursePartId,
      userId,
    );

    const createOptions = this.lessonRepository.create({
      ...createDto,
      coursePart,
    });

    const created = await this.lessonRepository.save(createOptions);

    return created;
  }

  async getUploadPath(filename, fileType) {
    const uploadPath = await this.fileManagerService.getS3UploadURL({
      filename: filename,
      fileType: fileType,
    });

    return uploadPath;
  }

  findAll() {
    return `This action returns all lessons`;
  }

  async findOneById(id: number, userId: number) {
    const query = this.lessonRepository
      .createQueryBuilder(lessonEntityName)
      .where(`${lessonEntityName}.isActive = true`)
      .andWhere(`${lessonEntityName}.id = :id`, { id })
      .innerJoinAndSelect(
        `${lessonEntityName}.${coursePartEntityName}`,
        coursePartEntityName,
        `${coursePartEntityName}.isActive = true`,
      )
      .innerJoinAndSelect(
        `${coursePartEntityName}.${courseEntityName}`,
        courseEntityName,
        `${courseEntityName}.isActive = true`,
      )
      .andWhere(`${courseEntityName}.userId = :userId`, { userId });

    const result = await query.getOne();

    return result;
  }

  async findOneOrFailById(id: number, userId: number): Promise<Lesson> {
    const found = await this.findOneById(id, userId);

    return handleFindOne(found);
  }

  async update(id: number, updateLessonDto: TUpdateLessonDto, userId: number) {
    const currentLesson = await this.findOneOrFailById(id, userId);

    const { type, ...updateDto } = updateLessonDto;

    if (currentLesson.type !== type) {
      // Xoa file
      // Xoa du lieu
    }

    const findConditions = {
      id,
      isActive: true,
    };

    const updated = await this.lessonRepository.update(
      findConditions,
      updateLessonDto,
    );

    return handleUpdateOne(updated);
  }

  async updateVideo(
    id: number,
    userId: number,
    updateLessonVideoDto: TUpdateLessonVideoDto,
    file: Express.Multer.File,
  ) {
    const currentLesson = await this.findOneOrFailById(id, userId);

    if (currentLesson.type !== ELessonType.Video) {
      throw new BadRequestException('bài học không phải dạng video');
    }

    const publishData: Omit<VideoTranscodePublishData, 'courseId'> = {
      lessonId: id,
      inputFilePath: file.path,
      outputFolder: '/courses/video',
      outputFilename: file.filename,
    };

    await this.scheduleService.amqpChannel.publish(
      RABBITMQ_VIDEO_TRANSCODE_EXCHANGE,
      RABBITMQ_VIDEO_TRANSCODE_ROUTING_KEY,
      publishData,
    );

    const findConditions = new Lesson({
      id,
      isActive: true,
    });

    const updateOptions: QueryDeepPartialEntity<Lesson> = {
      processingStatus: EVideoProcessingStatus.Processing,
      updatedBy: userId,
    };

    const updated = await this.lessonRepository.update(
      findConditions,
      updateOptions,
    );

    return handleUpdateOne(updated);
  }

  async remove(id: number, userId: number) {
    await this.findOneOrFailById(id, userId);

    const updated = await this.lessonRepository.update(
      { id },
      { isActive: false },
    );

    return handleUpdateOne(updated);
  }

  async streamVideo(
    id: number,
    userId: number,
    getStreamVideoDto: TGetLessonStreamVideoDto,
    req: Request,
    res: Response,
  ) {
    const lesson = await this.findOneOrFailById(id, userId);

    const { videoURL } = lesson;

    if (!videoURL) {
      throw new NotFoundException();
    }

    const videoPath = videoURL;

    const videoStat = fs.statSync(videoPath);

    const fileSize = videoStat.size;

    const videoRange = req.headers.range;

    if (videoRange) {
      const parts = videoRange.replace(/bytes=/, '').split('-');

      const start = parseInt(parts[0], 10);

      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      const chunksize = end - start + 1;

      const file = fs.createReadStream(videoPath, { start, end });

      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };

      res.writeHead(206, head);

      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };

      res.writeHead(200, head);

      fs.createReadStream(videoPath).pipe(res);
    }
  }
}
