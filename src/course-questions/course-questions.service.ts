import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Messages } from 'src/commons/messages';
import { handleDeleteOne, handleFindOne } from 'src/commons/record-handlers';
import { entityUtils } from 'src/commons/utils/entities.util';
import { courseAnswerEntityName } from 'src/course-answers/entities/course-answer.entity';
import { CoursesService } from 'src/courses/courses.service';
import { ECoursePublish } from 'src/courses/courses.type';
import { Course, courseEntityName } from 'src/courses/entities/course.entity';
import { orderItemEntityName } from 'src/order-items/entities/order-item.entity';
import { orderEntityName } from 'src/orders/entities/order.entity';
import { User, userEntityName } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
// import { CourseQuestionEntityService } from './course-question-entity.service';
import { CourseQuestionsUtil } from './course-questions.util';
import { CreateCourseQuestionDto } from './dto/create-course-question.dto';
import {
  FindAllCourseQuestionsConditions,
  FindManyCourseQuestionsDto,
} from './dto/find-course-question.dto';
import {
  CourseQuestion,
  courseQuestionEntityName,
} from './entities/course-question.entity';

@Injectable()
export class CourseQuestionsService {
  constructor(
    @InjectRepository(CourseQuestion)
    private readonly courseQuestionRepository: Repository<CourseQuestion>,
    // private readonly courseQuestionEntityService: CourseQuestionEntityService,
    private readonly courseQuestionsUtil: CourseQuestionsUtil,
    private readonly coursesService: CoursesService,
  ) {}

  async create(
    createCourseQuestionDto: CreateCourseQuestionDto,
    userId: number,
  ) {
    const { courseId, ...createDto } = createCourseQuestionDto;

    await this.coursesService.validateBought(courseId, userId);

    const createOptions = new CourseQuestion({
      ...createDto,
      course: new Course({ id: courseId, isActive: true }),
      user: new User({ id: userId, isActive: true }),
    });

    const created = await this.courseQuestionRepository.save(createOptions);

    return created;
  }

  async findMany(
    findManyCourseQuestionsDto: FindManyCourseQuestionsDto,
    userId: number,
  ) {
    const { pageSize, currentPage, ...findDto } = findManyCourseQuestionsDto;

    const { take, skip } = entityUtils.getPagination({
      pageSize,
      currentPage,
    });

    const query = this.findAllQuery(findDto, userId)
      .addSelect([
        // course questions
        `${courseQuestionEntityName}.content`,
        `${courseQuestionEntityName}.createdAt`,
        `${courseQuestionEntityName}.updatedAt`,
        // course answers
        `${courseAnswerEntityName}.id`,
        `${courseAnswerEntityName}.content`,
        `${courseAnswerEntityName}.createdAt`,
        // `${userEntityName} AS courseAnswerUser`,

        // user
        `${userEntityName}.id`,
        `${userEntityName}.fullname`,
        `${userEntityName}.avatarURL`,
        `${userEntityName}.role`,
        `${userEntityName}.isActive`,
        `${userEntityName}.facebookFullname`,
        `${userEntityName}.facebookAvatarURL`,
        `${userEntityName}.googleFullname`,
        `${userEntityName}.googleAvatarURL`,
      ])
      .addSelect('user AS courseAnswerUser.id', 'user AS courseAnswerUser_id')
      .addSelect(
        'user AS courseAnswerUser.fullname',
        'user AS courseAnswerUser_fullname',
      )
      .addSelect(
        'user AS courseAnswerUser.avatarURL',
        'user AS courseAnswerUser_avatarURL',
      )
      .addSelect(
        'user AS courseAnswerUser.role',
        'user AS courseAnswerUser_role',
      )
      .addSelect(
        'user AS courseAnswerUser.isActive',
        'user AS courseAnswerUser_isActive',
      )
      .addSelect(
        'user AS courseAnswerUser.facebookFullname',
        'user AS courseAnswerUser_facebookFullname',
      )
      .addSelect(
        'user AS courseAnswerUser.facebookAvatarURL',
        'user AS courseAnswerUser_facebookAvatarURL',
      )
      .addSelect(
        'user AS courseAnswerUser.googleFullname',
        'user AS courseAnswerUser_googleFullname',
      )
      .addSelect(
        'user AS courseAnswerUser.googleAvatarURL',
        'user AS courseAnswerUser_googleAvatarURL',
      )

      .orderBy({ [`${courseQuestionEntityName}.createdAt`]: 'DESC' })
      // .orderBy(`${courseQuestionEntityName}.createdAt`, 'DESC')
      .take(take)
      .skip(skip);

    const courseQuestions = await query.getMany();

    const result = this.courseQuestionsUtil.parseAll(courseQuestions);

    return result;
  }

  async count(
    findAllCourseQuestionsConditions: FindAllCourseQuestionsConditions,
    userId: number,
  ) {
    const query = this.findAllQuery(findAllCourseQuestionsConditions, userId);

    const result = await query.getCount();

    return result;
  }

  findOneById(id: number, userId: number) {
    const query = this.findQuery(userId);

    const result = query.getOne();

    return result;
  }

  async findOneOrFailById(id: number, userId: number): Promise<CourseQuestion> {
    const result = await this.findOneById(id, userId);

    return handleFindOne(result);
  }

  async remove(id: number, userId: number) {
    const courseQuestion = new CourseQuestion({
      id,
      isActive: true,
      user: new User({ id: userId, isActive: true }),
    });

    const deleted = await this.courseQuestionRepository.update(courseQuestion, {
      isActive: false,
    });

    return handleDeleteOne(deleted, Messages.course.question);
  }

  findQuery(currentUserId: number) {
    const query = this.courseQuestionRepository
      .createQueryBuilder(courseQuestionEntityName)
      .where(`${courseQuestionEntityName}.isActive = true`)
      .innerJoin(
        `${courseQuestionEntityName}.${userEntityName}`,
        userEntityName,
      )
      .innerJoin(
        `${courseQuestionEntityName}.${courseEntityName}`,
        courseEntityName,
        `${courseEntityName}.isActive = true AND ${courseEntityName}.publish = "${ECoursePublish.Published}"`,
      )
      .innerJoin(
        `${courseEntityName}.${orderItemEntityName}`,
        `${orderItemEntityName}`,
        `${orderItemEntityName}.isActive = true`,
      )
      .innerJoin(
        `${orderItemEntityName}.${orderEntityName}`,
        orderEntityName,
        `${orderEntityName}.isActive = true AND ${orderEntityName}.userId = :orderUserId`,
        {
          orderUserId: currentUserId,
        },
      )
      .leftJoin(
        `${courseQuestionEntityName}.${courseAnswerEntityName}`,
        courseAnswerEntityName,
        `${courseAnswerEntityName}.isActive = true`,
      )
      .select([`${courseQuestionEntityName}.id`])
      .leftJoin(
        `${courseAnswerEntityName}.${userEntityName}`,
        `${userEntityName} AS courseAnswerUser`,
      );

    return query;
  }

  findAllQuery(
    findAllCourseQuestionsConditions: FindAllCourseQuestionsConditions,
    currentUserId: number,
  ) {
    const { courseId, userId } = findAllCourseQuestionsConditions;

    let query = this.findQuery(currentUserId).andWhere(
      `${courseEntityName}.id = :courseId`,
      { courseId },
    );

    if (userId) {
      query = query.andWhere(`${courseQuestionEntityName}.userId = :userId`, {
        userId,
      });
    }

    return query;
  }

  findOneQuery(userId: number) {
    const query = this.findQuery(userId);

    return query;
  }
}
