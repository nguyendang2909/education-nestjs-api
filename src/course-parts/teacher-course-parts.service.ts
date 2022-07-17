import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Messages } from 'src/commons/messages';
import { handleFindOne, handleUpdateOne } from 'src/commons/record-handlers';
import { entityUtils } from 'src/commons/utils/entities.util';
import { CoursesService } from 'src/courses/courses.service';
import { Course, courseEntityName } from 'src/courses/entities/course.entity';
import { TeacherCoursesService } from 'src/courses/teacher-courses.service';
import { lessonEntityName } from 'src/lessons/entities/lesson.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { TCreateCoursePartDto } from './dto/create-course-part.dto';
import {
  TFindAllCoursePartsDto,
  TFindManyCoursePartsDto,
} from './dto/teacher-find-course-part.dto';
import { TUpdateCoursePartDto } from './dto/update-course-part.dto';
import {
  CoursePart,
  coursePartEntityName,
} from './entities/course-part.entity';

@Injectable()
export class TeacherCoursePartsService {
  constructor(
    @InjectRepository(CoursePart)
    private readonly coursePartRepository: Repository<CoursePart>,
    private readonly coursesService: CoursesService,
    @Inject(forwardRef(() => TeacherCoursesService))
    private readonly teacherCoursesService: TeacherCoursesService,
  ) {}

  async create(createCoursePartDto: TCreateCoursePartDto, userId: number) {
    const { courseId, ...createDto } = createCoursePartDto;

    const createOptions = new CoursePart({ ...createDto });

    const findCourse = await this.teacherCoursesService.findOneOrFailById(
      courseId,
      userId,
    );

    const course = new Course({ id: findCourse.id, isActive: true });

    createOptions.course = course;

    const created = this.coursePartRepository.save(createOptions);

    return created;
  }

  findQuery(userId: number): SelectQueryBuilder<CoursePart> {
    const query = this.coursePartRepository
      .createQueryBuilder(coursePartEntityName)
      .where(`${coursePartEntityName}.isActive = true`)
      .innerJoin(
        `${coursePartEntityName}.${courseEntityName}`,
        courseEntityName,
        `${courseEntityName}.isActive = true AND ${courseEntityName}.userId = :userId`,
        { userId },
      )
      .leftJoin(
        `${coursePartEntityName}.${lessonEntityName}`,
        lessonEntityName,
        `${lessonEntityName}.isActive = true`,
      )
      .select([`${coursePartEntityName}.id`]);

    return query;
  }

  findAllQuery(tFindAllCoursePartsDto: TFindAllCoursePartsDto, userId: number) {
    const { courseId } = tFindAllCoursePartsDto;

    let query = this.findQuery(userId);

    if (courseId) {
      query = query.andWhere(`${coursePartEntityName}.courseId = :courseId`, {
        courseId,
      });
    }

    return query;
  }

  async findMany(
    tFindManyCoursePartsDto: TFindManyCoursePartsDto,
    userId: number,
  ) {
    const { currentPage, pageSize, ...findDto } = tFindManyCoursePartsDto;

    const { take, skip } = entityUtils.getPagination({
      currentPage,
      pageSize,
    });

    const query = this.findAllQuery(findDto, userId)
      .addSelect([
        // Course parts
        `${coursePartEntityName}.name`,
        `${coursePartEntityName}.orderPosition`,
        // `${coursePartEntityName}.createdAt`,
        // `${coursePartEntityName}.updatedAt`,
        // Course lesson
        `${lessonEntityName}.id`,
        `${lessonEntityName}.name`,
        `${lessonEntityName}.trial`,
        `${lessonEntityName}.orderPosition`,
      ])
      .orderBy({
        [`${coursePartEntityName}.orderPosition`]: 'ASC',
        [`${lessonEntityName}.orderPosition`]: 'ASC',
      });

    const found = await query.take(take).skip(skip).getMany();

    return found;
  }

  async findOneById(
    id: number,
    userId: number,
  ): Promise<CoursePart | undefined> {
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
      .andWhere(`${courseEntityName}.userId = :userId`, {
        userId: userId,
      });

    const founds = query.getOne();

    return founds;
  }

  async findOneOrFailById(id: number, userId: number): Promise<CoursePart> {
    const found = await this.findOneById(id, userId);

    return handleFindOne(found, Messages.coursePart.name);
  }

  async updateOne(
    id: number,
    updateCoursePartDto: TUpdateCoursePartDto,
    userId: number,
  ) {
    await this.findOneOrFailById(id, userId);

    const updated = await this.coursePartRepository.update(
      { id, isActive: true },
      updateCoursePartDto,
    );

    handleUpdateOne(updated);
  }

  async removeOneBydId(id: number, userId: number) {
    await this.findOneOrFailById(id, userId);

    return await this.coursePartRepository.update(
      {
        id,
        isActive: true,
      },
      { isActive: false },
    );
  }

  async removeOneOrFailById(id: number, userId: number) {
    const deleted = await this.removeOneBydId(id, userId);

    return handleUpdateOne(deleted);
  }
}
