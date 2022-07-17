import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EVideoProcessingStatus } from 'src/commons/enums';
import { Messages } from 'src/commons/messages';
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
import {
  VideoTranscodeConsumeData,
  VideoTranscodePublishData,
} from 'src/schedules/schedules.type';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { AFindOneLessonConditions } from './dto/admin-find-lesson.dto';
import { AUpdateLessonDto } from './dto/admin-update-lesson.dto';
import { TCreateLessonDto } from './dto/create-lesson.dto';
import {
  TUpdateLessonDto,
  TUpdateLessonVideoDto,
} from './dto/update-lesson.dto';
import { Lesson, lessonEntityName } from './entities/lesson.entity';
import { ELessonType } from './lessons.enum';

@Injectable()
export class AdminLessonsService {
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

  findQuery() {
    const query = this.lessonRepository.createQueryBuilder(lessonEntityName);

    return query;
  }

  findAll() {
    return `This action returns all lessons`;
  }

  findOneQuery(
    aFindOneLessonConditions: AFindOneLessonConditions,
  ): SelectQueryBuilder<Lesson> {
    const { isActive, id } = aFindOneLessonConditions;

    let query = this.findQuery()
      .innerJoinAndSelect(
        `${lessonEntityName}.${coursePartEntityName}`,
        coursePartEntityName,
        `${coursePartEntityName}.isActive = true`,
      )
      .innerJoinAndSelect(
        `${coursePartEntityName}.${courseEntityName}`,
        courseEntityName,
        `${courseEntityName}.isActive = true`,
      );

    if (isActive) {
      query = query.andWhere(`${lessonEntityName}.isActive = :isActive`, {
        isActive: isActive,
      });
    }

    if (id) {
      query = query.andWhere(`${lessonEntityName}.id = :id`, {
        id,
      });
    }

    return query;
  }

  async findOne(aFindOneLessonConditions: AFindOneLessonConditions) {
    const query = this.findOneQuery(aFindOneLessonConditions);

    return await query.getOne();
  }

  async findOneOrFail(aFindOneLessonConditions: AFindOneLessonConditions) {
    const found = await this.findOne(aFindOneLessonConditions);

    return handleFindOne(found, Messages.course.lesson);
  }

  async findOneById(id: number) {
    const query = this.findOneQuery({ id });

    const result = await query.getOne();

    return result;
  }

  async findOneOrFailById(id: number): Promise<Lesson> {
    const found = await this.findOneById(id);

    return handleFindOne(found);
  }

  async update(id: number, aUpdateLessonDto: AUpdateLessonDto) {
    const currentLesson = await this.findOneOrFail({ id });

    const { ...updateDto } = aUpdateLessonDto;

    const findConditions = {
      id,
    };

    const updateOptions = { ...updateDto };

    const updated = await this.lessonRepository.update(
      findConditions,
      updateOptions,
    );

    return handleUpdateOne(updated);
  }

  async updateVideo(
    id: number,
    userId: number,
    updateLessonVideoDto: TUpdateLessonVideoDto,
    file: Express.Multer.File,
  ) {
    const currentLesson = await this.findOneOrFail({ id });

    if (currentLesson.type !== ELessonType.Video) {
      throw new BadRequestException('bài học không phải dạng video');
    }

    const publishData: VideoTranscodePublishData = {
      lessonId: id,
      inputFilePath: file.path,
      outputFolder: '/courses/video',
      outputFilename: file.filename,
      // allowPublic: false,
    };

    this.scheduleService.amqpChannel.publish(
      RABBITMQ_VIDEO_TRANSCODE_EXCHANGE,
      RABBITMQ_VIDEO_TRANSCODE_ROUTING_KEY,
      publishData,
    );

    const findConditions = {
      id,
      isActive: true,
    };

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
    await this.findOneOrFail({ id, isActive: true });

    const updated = await this.lessonRepository.update(
      { id },
      { isActive: false, updatedBy: userId },
    );

    return handleUpdateOne(updated);
  }

  async transcodeVideoToMp4(
    lessonVideoTranscodeConsumeData: VideoTranscodeConsumeData,
  ) {
    const { inputFilePath, outputFolder, outputFilename, lessonId } =
      lessonVideoTranscodeConsumeData;

    if (!inputFilePath || !outputFolder || !outputFilename || !lessonId) {
      throw new Error('hàng đợi không đủ dữ liệu');
    }

    const currentLesson = await this.findOneOrFail({
      id: lessonId,
      isActive: true,
    });

    const filePath = await this.fileManagerService.convertAndSaveVideoAsMp4({
      inputFilePath,
      outputFilename,
      outputFolder: '/courses/videos',
      allowPublic: false,
    });

    const videoInfo = await this.fileManagerService.getVideoInformation(
      filePath,
    );

    try {
      await this.update(lessonId, {
        processingStatus: EVideoProcessingStatus.Done,
        updatedBy: 1,
        videoURL: filePath,
        duration: videoInfo.format.duration,
      });

      if (currentLesson.videoURL) {
        this.fileManagerService.moveFileToTemp(currentLesson.videoURL);
      }
    } catch (err) {}
  }
}
