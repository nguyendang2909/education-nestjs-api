import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { handleFindOne } from 'src/commons/record-handlers';
import { entityUtils } from 'src/commons/utils/entities.util';
import { courseAnswerEntityName } from 'src/course-answers/entities/course-answer.entity';
import { ECoursePublish } from 'src/courses/courses.type';
import { courseEntityName } from 'src/courses/entities/course.entity';
import { userEntityName } from 'src/users/entities/user.entity';
import { UsersUtil } from 'src/users/users.util';
import { Repository } from 'typeorm';

import {
  TFindAllCourseQuestionsDto,
  TFindManyCourseQuestionsDto,
  TFindOneCourseQuestionConditions,
} from './dto/teacher-find-course-question.dto';
import {
  CourseQuestion,
  courseQuestionEntityName,
} from './entities/course-question.entity';

@Injectable()
export class TeacherCourseQuestionsService {
  constructor(
    @InjectRepository(CourseQuestion)
    private readonly courseQuestionRepository: Repository<CourseQuestion>,
    private readonly usersUtil: UsersUtil,
  ) {}

  async findMany(
    tFindManyCourseQuestionsDto: TFindManyCourseQuestionsDto,
    userId: number,
  ) {
    const { pageSize, currentPage, ...findDto } = tFindManyCourseQuestionsDto;

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
        'user AS courseAnswerUser.isActive',
        'user AS courseAnswerUser_isActive',
      )
      .addSelect(
        'user AS courseAnswerUser.role',
        'user AS courseAnswerUser_role',
      )
      .addSelect(
        'user AS courseAnswerUser.fullname',
        'user AS courseAnswerUser_fullname',
      )
      .addSelect(
        'user AS courseAnswerUser.avatarURL',
        'user AS courseAnswerUser_avatarURL',
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

    const questions = await query.getMany();

    return questions.map((question) => {
      if (question.user) {
        question.user = this.usersUtil.parse(question.user);
      }

      if (question.courseAnswer) {
        question.courseAnswer = question.courseAnswer.map((courseAnswer) => {
          if (courseAnswer.user) {
            courseAnswer.user = this.usersUtil.parse(courseAnswer.user);
          }

          return courseAnswer;
        });
      }

      return question;
    });
  }

  async count(
    tFindAllCourseQuestionsConditions: TFindAllCourseQuestionsDto,
    userId: number,
  ) {
    const query = this.findAllQuery(tFindAllCourseQuestionsConditions, userId);

    const result = await query.getCount();

    return result;
  }

  async findOneOrFailById(id: number, userId: number): Promise<CourseQuestion> {
    const result = await this.findOneQuery({ id }, userId).getOne();

    return handleFindOne(result);
  }

  findQuery(teacherId: number) {
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
        `${courseEntityName}.isActive = true AND ${courseEntityName}.publish = "${ECoursePublish.Published}" AND ${courseEntityName}.userId = :teacherId`,
        { teacherId },
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
    tFindAllCourseQuestionsConditions: TFindAllCourseQuestionsDto,
    userId: number,
  ) {
    const { courseId } = tFindAllCourseQuestionsConditions;

    let query = this.findQuery(userId);

    if (courseId) {
      query = query.andWhere(`${courseEntityName}.id = :courseId`, {
        courseId,
      });
    }

    return query;
  }

  findOneQuery(
    tFindOneCourseQuestionConditions: TFindOneCourseQuestionConditions,
    teacherId: number,
  ) {
    const { id } = tFindOneCourseQuestionConditions;

    let query = this.findQuery(teacherId);

    if (id) {
      query = query.andWhere(`${courseQuestionEntityName}.id = :id`, { id });
    }

    return query;
  }
}
