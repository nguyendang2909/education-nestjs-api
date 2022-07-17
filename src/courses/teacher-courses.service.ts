import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CourseSubcategory,
  courseSubcategoryEntityName,
} from 'src/course-subcategories/entities/course-subcategory.entity';
import { FindConditions, Repository, SelectQueryBuilder } from 'typeorm';
import { TCreateCourseDto } from './dto/teacher-create-course.dto';
import {
  TUpdateCourseDto,
  TUpdateCourseImageDto,
  TUpdateCourseVideoDto,
} from './dto/teacher-update-course.dto';
import { Course, courseEntityName } from './entities/course.entity';
import { UserWithoutPassword } from 'src/users/users.type';
import { User, userEntityName } from 'src/users/entities/user.entity';
import { handleFindOne, handleUpdateOne } from 'src/commons/record-handlers';
import { FileManagerService } from 'src/file-manager/file-manager.service';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import {
  ECourseImageType,
  ECoursePublish,
  ECourseVideoType,
} from './courses.type';
import _ from 'lodash';
import {
  TFindAllCoursesDto,
  TFindManyCourseDto,
} from './dto/teacher-find-course.dto';
import { courseCategoryName } from 'src/course-categories/entities/course-category.entity';
import { Messages } from 'src/commons/messages';
import {
  RABBITMQ_VIDEO_TRANSCODE_EXCHANGE,
  RABBITMQ_VIDEO_TRANSCODE_ROUTING_KEY,
} from 'src/config';
import { SchedulesService } from 'src/schedules/schedules.service';
import { VideoTranscodePublishData } from 'src/schedules/schedules.type';
import { EVideoProcessingStatus } from 'src/commons/enums';
import { Request, Response } from 'express';
import fs from 'fs';
import { TGetCourseStreamVideoDto } from './dto/teacher-get-course-stream-video.dto';
import { entityUtils } from 'src/commons/utils/entities.util';

@Injectable()
export class TeacherCoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly fileManagerService: FileManagerService,
    @Inject(forwardRef(() => SchedulesService))
    private readonly scheduleService: SchedulesService,
  ) {}

  async create(createCourseDto: TCreateCourseDto, userId: number) {
    const { courseSubcategoryId, name, ...createDto } = createCourseDto;

    const courseSubcategory = new CourseSubcategory();

    courseSubcategory.id = courseSubcategoryId;

    const user = new User({ id: userId, isActive: true });

    const createOptions = new Course({
      name,
      ...createDto,
      user,
      courseSubcategory,
    });

    const created = await this.courseRepository.save(createOptions);

    return created;
  }

  findQuery(userId: number): SelectQueryBuilder<Course> {
    const query = this.courseRepository
      .createQueryBuilder(courseEntityName)
      .where(`${courseEntityName}.isActive = true`)
      .andWhere(`${courseEntityName}.userId = :userId`, { userId })
      .innerJoin(
        `${courseEntityName}.${userEntityName}`,
        `${userEntityName}`,
        `${userEntityName}.isActive = true`,
      )
      .leftJoin(
        `${courseEntityName}.${courseSubcategoryEntityName}`,
        `${courseSubcategoryEntityName}`,
        `${courseSubcategoryEntityName}.isActive = true`,
      )
      .leftJoin(
        `${courseSubcategoryEntityName}.${courseCategoryName}`,
        `${courseCategoryName}`,
        `${courseCategoryName}.isActive = true`,
      );

    return query;
  }

  findAllQuery(tFindAllCoursesDto: TFindAllCoursesDto, userId: number) {
    const {
      name,
      courseSubcategoryId: courseSubcategoryIdAsString,
      courseCategoryId: courseCategoryIdAsString,
      publish,
      commonPrice,
    } = tFindAllCoursesDto;

    let query = this.findQuery(userId);

    if (name) {
      query = query.andWhere(`${courseEntityName}.name LIKE :name`, {
        name: `%${name}%`,
      });
    }

    if (courseSubcategoryIdAsString) {
      const courseSubcategoryId = +courseSubcategoryIdAsString;

      query = query.andWhere(
        `${courseSubcategoryEntityName}.id = :courseSubcategoryId`,
        { courseSubcategoryId },
      );
    }

    if (courseCategoryIdAsString) {
      const courseCategoryId = +courseCategoryIdAsString;

      query = query.andWhere(`${courseCategoryName}.id = :courseCategoryId`, {
        courseCategoryId,
      });
    }

    if (publish) {
      query = query.andWhere(`${courseEntityName}.publish = :publish`, {
        publish,
      });
    }

    if (commonPrice) {
      query = query
        .andWhere(`${courseEntityName}.price = :commonPrice `, {
          commonPrice,
        })
        .orWhere(`${courseEntityName}.promotionPrice = :commonPrice`, {
          commonPrice,
        });
    }

    query = query.select([`${courseEntityName}.id`]);

    return query;
  }

  async findMany(
    tFindManyCourseDto: TFindManyCourseDto,
    userId: number,
  ): Promise<Course[]> {
    const { currentPage, pageSize, sortName, sortCreatedAt, ...findDto } =
      tFindManyCourseDto;

    const { take, skip } = entityUtils.getPagination({
      currentPage: currentPage,
      pageSize: pageSize,
    });

    let query = this.findAllQuery(findDto, userId)
      .addSelect([
        `${courseEntityName}.name`,
        `${courseEntityName}.price`,
        `${courseEntityName}.promotionPrice`,
        `${courseEntityName}.coverImageURL`,
        `${courseEntityName}.publish`,
        `${courseEntityName}.createdAt`,
        `${courseEntityName}.updatedAt`,
      ])
      .addSelect([
        `${courseSubcategoryEntityName}.id`,
        `${courseSubcategoryEntityName}.name`,
      ])
      .addSelect([
        `${courseCategoryName}.id`,
        `${courseCategoryName}.name`,
        `${courseCategoryName}.icon`,
      ])
      .addSelect([`${userEntityName}.fullname`, `${userEntityName}.id`]);

    if (sortName) {
      query = query.addOrderBy(`${courseEntityName}.name`, sortName);
    }

    if (sortCreatedAt) {
      query = query.addOrderBy(`${courseEntityName}.createdAt`, sortCreatedAt);
    }

    query = query.take(take).skip(skip);

    const found = await query.getMany();

    return found;
  }

  async count(
    tFindAllCoursesDto: TFindAllCoursesDto,
    userId: number,
  ): Promise<number> {
    const query = this.findAllQuery(tFindAllCoursesDto, userId);

    const count = await query.getCount();

    return count;
  }

  async findOneById(id: number, userId: number): Promise<Course | undefined> {
    let query = this.findQuery(userId);

    query = query
      .andWhere(`${courseEntityName}.id = :id`, { id })
      .select(`${courseEntityName}.id`)
      .addSelect([
        // Select course
        `${courseEntityName}.coverImageURL`,
        `${courseEntityName}.bannerURL`,
        `${courseEntityName}.introductionVideoURL`,
        `${courseEntityName}.subTitle`,
        `${courseEntityName}.about`,
        `${courseEntityName}.output`,
        `${courseEntityName}.publish`,
        `${courseEntityName}.name`,
        `${courseEntityName}.price`,
        `${courseEntityName}.promotionPrice`,
        `${courseEntityName}.duration`,
        `${courseEntityName}.certificate`,
        `${courseEntityName}.introductionVideoProcessingStatus`,
        `${courseEntityName}.createdAt`,
        `${courseEntityName}.updatedAt`,
        // Select subcategory
        `${courseSubcategoryEntityName}.id`,
        `${courseSubcategoryEntityName}.name`,
        // select course category
        `${courseCategoryName}.id`,
        `${courseCategoryName}.name`,
        `${courseCategoryName}.icon`,
      ]);

    const course = await query.getOne();

    return course;
  }

  async findOneOrFailById(id: number, userId: number): Promise<Course> {
    const course = await this.findOneById(id, userId);

    return handleFindOne(course, Messages.course.name);
  }

  async update(id: number, userId: number, tUpdateCourseDto: TUpdateCourseDto) {
    await this.findOneOrFailById(id, userId);

    const findConditions = this.courseRepository.create({
      id: id,
      isActive: true,
    });

    const {
      courseSubcategoryId,
      publish,
      price,
      promotionPrice,
      ...updateDto
    } = tUpdateCourseDto;

    const updateOptions: QueryDeepPartialEntity<Course> = {
      ...updateDto,
    };

    if (courseSubcategoryId) {
      const courseSubcategory = new CourseSubcategory();

      courseSubcategory.id = courseSubcategoryId;

      updateOptions.courseSubcategory = courseSubcategory;
    }

    if (price !== undefined) {
      updateOptions.price = price;

      if (promotionPrice === undefined || !_.isNumber(promotionPrice)) {
        updateOptions.promotionPrice = undefined;
      } else {
        if (promotionPrice >= price) {
          throw new BadRequestException(
            'Yêu cầu giá khuyến mãi thấp hơn giá gốc!',
          );
        }

        updateOptions.promotionPrice = promotionPrice;
      }
    }

    if (publish) {
      if (publish === ECoursePublish.Published) {
        throw new ForbiddenException();
      } else {
        updateOptions.publish = publish;
      }
    }

    const updated = await this.courseRepository.update(
      findConditions,
      updateOptions,
    );

    const result = handleUpdateOne(updated);

    return result;
  }

  async updateImage(
    id: number,
    userId: number,
    tUpdateCourseImageDto: TUpdateCourseImageDto,
    file: Express.Multer.File,
  ) {
    await this.findOneOrFailById(id, userId);

    const { documentType } = tUpdateCourseImageDto;

    const updateOptions: QueryDeepPartialEntity<Course> = {};

    switch (documentType) {
      case ECourseImageType.Banner:
        const bannerURL = await this.fileManagerService.uploadImageAsJpg({
          file: file,
          folder: 'courses/images',
          allowPublic: true,
        });
        updateOptions.bannerURL = bannerURL;
        break;

      case ECourseImageType.CoverImage:
        const coverURL = await this.fileManagerService.uploadImageAsJpg({
          file: file,
          folder: 'courses/images',
          allowPublic: true,
        });
        updateOptions.coverImageURL = coverURL;
        break;

      default:
        throw new BadRequestException('loại file không đúng');
    }

    const findConditions = new Course({
      id: id,
      isActive: true,
    });

    const updated = await this.courseRepository.update(
      findConditions,
      updateOptions,
    );

    const result = handleUpdateOne(updated);

    return result;
  }

  async updateVideo(
    id: number,
    userId: number,
    tUpdateCourseVideoDto: TUpdateCourseVideoDto,
    file: Express.Multer.File,
  ) {
    const currentCourse = await this.findOneOrFailById(id, userId);

    const { documentType } = tUpdateCourseVideoDto;

    switch (documentType) {
      case ECourseVideoType.VideoIntroduction:
        const publishData: Omit<VideoTranscodePublishData, 'lessonId'> = {
          courseId: id,
          inputFilePath: file.path,
          outputFolder: '/courses/video',
          outputFilename: file.filename,
        };

        await this.scheduleService.amqpChannel.publish(
          RABBITMQ_VIDEO_TRANSCODE_EXCHANGE,
          RABBITMQ_VIDEO_TRANSCODE_ROUTING_KEY,
          publishData,
        );

        break;

      default:
        throw new BadRequestException('loại file không đúng');
    }

    const findConditions = new Course({
      id: id,
      isActive: true,
    });

    const updateOptions: QueryDeepPartialEntity<Course> = {
      introductionVideoProcessingStatus: EVideoProcessingStatus.Processing,
      updatedBy: userId,
    };

    const updated = await this.courseRepository.update(
      findConditions,
      updateOptions,
    );

    return handleUpdateOne(updated, Messages.course.videoIntroduction);
  }

  async remove(id: number, currentUser: UserWithoutPassword) {
    const user = new User({ id: currentUser.id, isActive: true });

    const findConditions: FindConditions<Course> = {
      id,
      isActive: true,
      user,
    };

    const { affected: deleted } = await this.courseRepository.update(
      findConditions,
      {
        isActive: false,
      },
    );

    if (!deleted) {
      throw new BadRequestException(
        'Không xoá được khoá học, vui lòng thử lại',
      );
    }

    return { message: 'Xoá khoá học thành công' };
  }

  async streamVideo(
    id: number,
    userId: number,
    getStreamVideoDto: TGetCourseStreamVideoDto,
    req: Request,
    res: Response,
  ) {
    const course = await this.findOneOrFailById(id, userId);

    const { introductionVideoURL } = course;

    if (!introductionVideoURL) {
      throw new NotFoundException();
    }

    const videoPath = introductionVideoURL;

    const videoStat = fs.statSync(introductionVideoURL);

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
