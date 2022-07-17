import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Messages, messagesService } from 'src/commons/messages';
import { handleFindOne } from 'src/commons/record-handlers';
import { entityUtils } from 'src/commons/utils/entities.util';
import { CoursesService } from 'src/courses/courses.service';
import { Course, courseEntityName } from 'src/courses/entities/course.entity';
import { User, userEntityName } from 'src/users/entities/user.entity';
import { FindConditions, Repository, SelectQueryBuilder } from 'typeorm';
import { CountCourseRatings } from './course-ratings.type';
import { CourseRatingsUtil } from './course-ratings.util';
import { CreateCourseRatingDto } from './dto/create-course-rating.dto';
import {
  FindAllCourseRatingDto,
  FindManyCourseRatingDto,
  FindOneCourseRatingConditions,
} from './dto/find-course-ratings.dto';
import {
  CourseRating,
  courseRatingEntityName,
} from './entities/course-rating.entity';

@Injectable()
export class CourseRatingsService {
  constructor(
    @InjectRepository(CourseRating)
    private readonly courseRatingRepository: Repository<CourseRating>,
    private readonly courseRatingsUtil: CourseRatingsUtil,
    private readonly coursesService: CoursesService,
  ) {}

  public async create(
    createCourseRatingDto: CreateCourseRatingDto,
    userId: number,
  ) {
    const { courseId, ...createDto } = createCourseRatingDto;

    const existCourse = await this.coursesService
      .findOneQuery({ id: courseId })
      .getOne();

    if (!existCourse) {
      throw new NotFoundException(
        messagesService.setNotFound(Messages.course.name),
      );
    }

    const existCourseRating = await this.findOneQuery({
      userId,
      courseId,
    }).getOne();

    if (existCourseRating) {
      throw new BadRequestException('Bạn đã đánh giá khoá học rồi!');
    }

    const course = new Course({ id: courseId, isActive: true });

    const user = new User({ id: userId });

    const courseRating = new CourseRating({ course, user, ...createDto });

    const created = await this.courseRatingRepository.save(courseRating);

    return created;
  }

  public async findMany(findManyCourseRatingDto: FindManyCourseRatingDto) {
    const { pageSize, currentPage, ...findDto } = findManyCourseRatingDto;

    const { take, skip } = entityUtils.getPagination({
      pageSize,
      currentPage,
    });

    const query = this.findAllQuery(findDto);

    const found = await query
      .addSelect([
        // course rating
        `${courseRatingEntityName}.rating`,
        `${courseRatingEntityName}.updatedAt`,
        `${courseRatingEntityName}.comment`,
        // user
        `${userEntityName}.fullname`,
        `${userEntityName}.phoneNumber`,
        `${userEntityName}.avatarURL`,
        `${userEntityName}.facebookFullname`,
        `${userEntityName}.facebookAvatarURL`,
        `${userEntityName}.googleFullname`,
        `${userEntityName}.googleAvatarURL`,
      ])
      .take(take)
      .skip(skip)
      .getMany();

    const result = this.courseRatingsUtil.parseAll(found);

    return result;
  }

  public async count(
    findAllCourseRatingDto: FindAllCourseRatingDto,
  ): Promise<CountCourseRatings> {
    const query = this.findAllQuery(findAllCourseRatingDto);

    const result = {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
      count: 0,
      average: 0,
    };

    let totalPoint = 0;

    const ratingPoints = await query
      .select(`COUNT(${courseRatingEntityName}.rating)`, 'count')
      .addSelect([`rating`])
      .groupBy(`rating`)
      .getRawMany<{ count: string; rating: 1 | 2 | 3 | 4 | 5 }>();

    const ratingPointsLength = ratingPoints.length;

    for (let i = 0; i < ratingPointsLength; i += 1) {
      const ratingPoint = ratingPoints[i];

      const count = parseInt(ratingPoint.count);

      const rating = ratingPoint.rating;

      result[rating] = count;

      totalPoint += rating * count;

      result.count += count;
    }

    result.average = +(totalPoint / result.count).toFixed(1);

    return result;
  }

  // async findOne(
  //   findOneCourseRating: FindOneCourseRating,
  // ): Promise<CourseRating | undefined> {
  //   const query = this.findOneQuery(findOneCourseRating);

  //   const found = await query.getOne();

  //   return found;
  // }

  // async findOneOrFail(
  //   findOneCourseRating: FindOne,
  // ): Promise<CourseRating> {
  //   const found = await this.findOne(findOneCourseRating);

  //   return handleFindOne(found);
  // }

  public async findOneById(id: number): Promise<CourseRating | undefined> {
    const query = this.findOneQuery({ id });

    const found = await query.getOne();

    return found;
  }

  public async findOneOrFailById(id: number): Promise<CourseRating> {
    const found = await this.findOneById(id);

    return handleFindOne(found);
  }

  findQuery(): SelectQueryBuilder<CourseRating> {
    const query = this.courseRatingRepository
      .createQueryBuilder(courseRatingEntityName)
      .where(`${courseRatingEntityName}.isActive = true`)
      .innerJoin(
        `${courseRatingEntityName}.${courseEntityName}`,
        courseEntityName,
        `${courseEntityName}.isActive = true`,
      )
      .innerJoin(`${courseRatingEntityName}.${userEntityName}`, userEntityName)
      .select(`${courseRatingEntityName}.id`);
    return query;
  }

  findAllQuery(
    findAllCourseRating: FindAllCourseRatingDto,
  ): SelectQueryBuilder<CourseRating> {
    const { rating, courseId, userId, teacherId } = findAllCourseRating;

    let query = this.findQuery();

    if (rating) {
      query = query.andWhere(`${courseRatingEntityName}.rating = :rating`, {
        rating,
      });
    }

    if (courseId) {
      query = query.andWhere(`${courseRatingEntityName}.courseId = :courseId`, {
        courseId,
      });
    }

    if (userId) {
      query = query.andWhere(`${courseRatingEntityName}.userId = :userId`, {
        userId,
      });
    }

    if (teacherId) {
      query = query.andWhere(`${courseEntityName}.userId = :teacherId`, {
        teacherId,
      });
    }

    return query;
  }

  findOneQuery(
    findOneCourseRating: FindOneCourseRatingConditions,
  ): SelectQueryBuilder<CourseRating> {
    const { id, courseId, userId } = findOneCourseRating;

    let query = this.findQuery();

    if (id) {
      query = query.andWhere(`${courseRatingEntityName}.id = :id`, { id });
    }

    if (courseId) {
      query = query.andWhere(`${courseRatingEntityName}.courseId = :courseId`, {
        courseId,
      });
    }

    if (userId) {
      query = query.andWhere(`${courseRatingEntityName}.userId = :userId`, {
        userId,
      });
    }

    return query;
  }

  async update(
    findConditions: FindConditions<CourseRating>,
    updateOptions: Partial<CourseRating>,
  ) {
    return await this.courseRatingRepository.update(
      findConditions,
      updateOptions,
    );
  }
}
