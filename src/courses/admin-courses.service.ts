import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CourseSubcategory,
  courseSubcategoryEntityName,
} from 'src/course-subcategories/entities/course-subcategory.entity';
import { FindConditions, Repository, SelectQueryBuilder } from 'typeorm';
import { Course, courseEntityName } from './entities/course.entity';
import { userEntityName } from 'src/users/entities/user.entity';
import { handleFindOne, handleUpdateOne } from 'src/commons/record-handlers';
import { FileManagerService } from 'src/file-manager/file-manager.service';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import _ from 'lodash';
import { courseCategoryName } from 'src/course-categories/entities/course-category.entity';
import { Messages } from 'src/commons/messages';
import {
  AFindAllCoursesDto,
  AFindManyCourseDto,
  AFindOneCourseConditions,
} from './dto/admin-find-course.dto';
import { AUpdateCourseDto } from './dto/admin-update-course.dto';
import { VideoTranscodeConsumeData } from 'src/schedules/schedules.type';
import { EVideoProcessingStatus } from 'src/commons/enums';
import { entityUtils } from 'src/commons/utils/entities.util';

@Injectable()
export class AdminCoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly fileManagerService: FileManagerService,
  ) {}

  findQuery(): SelectQueryBuilder<Course> {
    const query = this.courseRepository
      .createQueryBuilder(courseEntityName)
      .innerJoinAndSelect(
        `${courseEntityName}.${userEntityName}`,
        `${userEntityName}`,
      )
      .innerJoinAndSelect(
        `${courseEntityName}.${courseSubcategoryEntityName}`,
        `${courseSubcategoryEntityName}`,
      )
      .innerJoinAndSelect(
        `${courseSubcategoryEntityName}.${courseCategoryName}`,
        `${courseCategoryName}`,
      );

    return query;
  }

  findAllQuery(aFindAllCoursesDto: AFindAllCoursesDto) {
    const {
      name,
      courseSubcategoryId: courseSubcategoryIdAsString,
      courseCategoryId: courseCategoryIdAsString,
      publish,
      commonPrice,
      userId,
      isActive,
    } = aFindAllCoursesDto;

    let query = this.findQuery();

    if (isActive) {
      query = query.andWhere(`${courseEntityName}.isActive = :isActive`, {
        isActive: JSON.parse(isActive),
      });
    }

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

    if (userId) {
      query = query.andWhere(`${userEntityName} = :userId`, { userId });
    }

    return query;
  }

  async findMany(aFindManyCourseDto: AFindManyCourseDto): Promise<Course[]> {
    const { currentPage, pageSize, ...findDto } = aFindManyCourseDto;

    const { take, skip } = entityUtils.getPagination({
      currentPage: currentPage,
      pageSize: pageSize,
    });

    const query = this.findAllQuery(findDto).take(take).skip(skip);

    const found = await query.getMany();

    return found;
  }

  async count(aFindAllCoursesDto: AFindAllCoursesDto): Promise<number> {
    const query = this.findAllQuery(aFindAllCoursesDto);

    const count = await query.getCount();

    return count;
  }

  findOneQuery(
    aFindOneCourseConditions: AFindOneCourseConditions,
  ): SelectQueryBuilder<Course> {
    const { isActive, id } = aFindOneCourseConditions;

    let query = this.findQuery();

    if (isActive) {
      query = query.andWhere(`${courseEntityName}.isActive = :isActive`, {
        isActive,
      });
    }

    if (id) {
      query = query.andWhere(`${courseEntityName}.id = :id`, {
        id,
      });
    }

    return query;
  }

  async findOne(aFindOneCourseConditions: AFindOneCourseConditions) {
    const query = this.findOneQuery(aFindOneCourseConditions);

    return await query.getOne();
  }

  async findOneOrFail(aFindOneCourseConditions: AFindOneCourseConditions) {
    return handleFindOne(
      await this.findOne(aFindOneCourseConditions),
      Messages.course.name,
    );
  }

  async findOneById(id: number): Promise<Course | undefined> {
    const query = this.findOneQuery({ id });

    const course = await query.getOne();

    return course;
  }

  async findOneOrFailById(id: number): Promise<Course> {
    const course = await this.findOneById(id);

    return handleFindOne(course, Messages.course.name);
  }

  async update(id: number, tUpdateCourseDto: AUpdateCourseDto) {
    const course = await this.findOneOrFailById(id);

    handleFindOne(course);

    const findConditions = new Course({
      id: course.id,
    });

    const { courseSubcategoryId, price, promotionPrice, ...updateDto } =
      tUpdateCourseDto;

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

    const updated = await this.courseRepository.update(
      findConditions,
      updateOptions,
    );

    const result = handleUpdateOne(updated);

    return result;
  }

  async remove(id: number) {
    const findConditions: FindConditions<Course> = {
      id,
      isActive: true,
    };

    const updated = await this.courseRepository.update(findConditions, {
      isActive: false,
    });

    return handleUpdateOne(updated, Messages.course.name);
  }

  async transcodeVideoToMp4(
    lessonVideoTranscodeConsumeData: VideoTranscodeConsumeData,
  ) {
    const { inputFilePath, outputFolder, outputFilename, courseId } =
      lessonVideoTranscodeConsumeData;
    if (!inputFilePath || !outputFolder || !outputFilename || !courseId) {
      throw new Error('hàng đợi không đủ dữ liệu');
    }

    const currentCourse = await this.findOneOrFail({
      id: courseId,
      isActive: true,
    });

    const filePath = await this.fileManagerService.convertAndSaveVideoAsMp4({
      inputFilePath,
      outputFilename,
      outputFolder: '/courses/videos',
      allowPublic: false,
    });

    const result = await this.update(courseId, {
      updatedBy: 1,
      introductionVideoURL: filePath,
      introductionVideoProcessingStatus: EVideoProcessingStatus.Done,
    });

    if (currentCourse.introductionVideoURL) {
      this.fileManagerService.moveFileToTemp(currentCourse.videoURL);
    }

    return result;
  }
}
