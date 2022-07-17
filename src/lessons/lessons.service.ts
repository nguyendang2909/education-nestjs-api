import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request, Response } from 'express';
import { CoursePartsService } from 'src/course-parts/course-parts.service';
import { coursePartEntityName } from 'src/course-parts/entities/course-part.entity';
import { courseEntityName } from 'src/courses/entities/course.entity';
import { FileManagerService } from 'src/file-manager/file-manager.service';
import { Repository } from 'typeorm';
import { GetLessonStreamVideoDto } from './dto/get-lesson-stream-video.dto';
import { Lesson, lessonEntityName } from './entities/lesson.entity';
import fs from 'fs';
import { Messages, messagesService } from 'src/commons/messages';
import { orderItemEntityName } from 'src/order-items/entities/order-item.entity';
import { orderEntityName } from 'src/orders/entities/order.entity';
import { EOrderStatus } from 'src/orders/orders.enum';
import { FindOneLessonConditions } from './dto/find-lesson.dto';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    private readonly coursePartsService: CoursePartsService,
    private readonly fileManagerService: FileManagerService,
  ) {}

  async getUploadPath(filename, fileType) {
    const uploadPath = await this.fileManagerService.getS3UploadURL({
      filename: filename,
      fileType: fileType,
    });

    return uploadPath;
  }

  async findOneOrFailById(id: number, currentUserId: number) {
    let query = this.findOneQuery({ id }, currentUserId);

    query = query.select([
      // lesson
      `${lessonEntityName}.id`,
      `${lessonEntityName}.name`,
      `${lessonEntityName}.type`,
      `${lessonEntityName}.videoURL`,
      `${lessonEntityName}.trial`,
      `${lessonEntityName}.orderPosition`,
      `${lessonEntityName}.processingStatus`,
      `${lessonEntityName}.duration`,
      `${lessonEntityName}.updatedAt`,
      `${lessonEntityName}.createdAt`,
      // course parts
      `${coursePartEntityName}.id`,
      // course
      `${courseEntityName}.id`,
      // order item
      `${orderItemEntityName}.id`,
      // order
      `${orderEntityName}.status`,
    ]);

    const lesson = await query.getOne();

    if (!lesson) {
      throw new NotFoundException(
        messagesService.setNotFound(Messages.course.lesson),
      );
    }

    return lesson;
  }

  async streamVideo(
    id: number,
    userId: number,
    getStreamVideoDto: GetLessonStreamVideoDto,
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

  async streamTrialVideo(
    id: number,
    getStreamVideoDto: GetLessonStreamVideoDto,
    req: Request,
    res: Response,
  ) {
    const lesson = await this.findOneTrialQuery({ id })
      .addSelect([`${lessonEntityName}.videoURL`])
      .getOne();

    if (!lesson) {
      throw new NotFoundException();
    }

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

  findQuery() {
    const query = this.lessonRepository
      .createQueryBuilder(lessonEntityName)
      .where(`${lessonEntityName}.isActive = true`)
      .innerJoin(
        `${lessonEntityName}.${coursePartEntityName}`,
        coursePartEntityName,
        `${coursePartEntityName}.isActive = true`,
      )
      .innerJoin(
        `${coursePartEntityName}.${courseEntityName}`,
        courseEntityName,
      );

    return query;
  }

  findOneTrialQuery(findOneQueryConditions: FindOneLessonConditions) {
    const { id } = findOneQueryConditions;

    const query = this.findQuery()
      .andWhere(`${lessonEntityName}.id = :id`, {
        id,
      })
      .andWhere(`${lessonEntityName}.trial = :trial`, {
        trial: true,
      });

    return query;
  }

  findOneQuery(
    findOneQueryConditions: FindOneLessonConditions,
    currentUserId: number,
  ) {
    const { id } = findOneQueryConditions;

    let query = this.findQuery()
      .innerJoin(
        `${courseEntityName}.${orderItemEntityName}`,
        orderItemEntityName,
      )
      .innerJoin(
        `${orderItemEntityName}.${orderEntityName}`,
        orderEntityName,
        `${orderEntityName}.isActive = true AND ${orderEntityName}.status = :orderStatus AND ${orderEntityName}.userId = :orderUserId`,
        {
          orderUserId: currentUserId,
          orderStatus: EOrderStatus.Success,
        },
      );

    query = query.andWhere(`${lessonEntityName}.id = :id`, { id });

    return query;
  }
}
