import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Messages } from 'src/commons/messages';
import { handleFindOne } from 'src/commons/record-handlers';
import { CoursesService } from 'src/courses/courses.service';
import { ECoursePublish } from 'src/courses/courses.type';
import { courseEntityName } from 'src/courses/entities/course.entity';
import { TeacherCoursesService } from 'src/courses/teacher-courses.service';
import { lessonEntityName } from 'src/lessons/entities/lesson.entity';
import { UserWithoutPassword } from 'src/users/users.type';
import { Repository } from 'typeorm';
import {
  CoursePart,
  coursePartEntityName,
} from './entities/course-part.entity';

@Injectable()
export class CoursePartsService {
  constructor(
    @InjectRepository(CoursePart)
    private readonly coursePartRepository: Repository<CoursePart>,
    private readonly coursesService: CoursesService,
    private readonly teacherCoursesService: TeacherCoursesService,
  ) {}

  findAll() {
    return `This action returns all courseParts`;
  }

  findOneQuery(id, user?: UserWithoutPassword) {
    const query = this.coursePartRepository
      .createQueryBuilder(coursePartEntityName)
      .where(`${coursePartEntityName}.isActive = true`)
      .andWhere(`${coursePartEntityName}.id = :id`, { id })
      .innerJoinAndSelect(
        `${coursePartEntityName}.${courseEntityName}`,
        courseEntityName,
        `${courseEntityName}.isActive = true`,
      )
      .leftJoinAndSelect(
        `${coursePartEntityName}.${lessonEntityName}`,
        lessonEntityName,
        `${lessonEntityName}.isActive = true`,
      )
      .andWhere(`${courseEntityName}.publish = "${ECoursePublish.Published}"`);

    return query;
  }

  async findOneById(
    id: number,
    user?: UserWithoutPassword,
  ): Promise<CoursePart | undefined> {
    const query = this.findOneQuery(id, user);

    const founds = query.getOne();

    return founds;
  }

  async findOneOrFailById(
    id: number,
    user?: UserWithoutPassword,
  ): Promise<CoursePart> {
    const found = await this.findOneById(id, user);

    return handleFindOne(found, Messages.coursePart.name);
  }
}
