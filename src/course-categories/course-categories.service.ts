import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Messages } from 'src/commons/messages';
import { handleFindOne } from 'src/commons/record-handlers';
import { courseSubcategoryEntityName } from 'src/course-subcategories/entities/course-subcategory.entity';
import { ECoursePublish } from 'src/courses/courses.type';
import { courseEntityName } from 'src/courses/entities/course.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  FindAllCourseCategoriesDto,
  FindManyCourseCategoriesDto,
} from './dto/find-all-course-categories.dto';
import {
  CourseCategory,
  courseCategoryName,
} from './entities/course-category.entity';

@Injectable()
export class CourseCategoriesService {
  constructor(
    @InjectRepository(CourseCategory)
    private readonly courseCategoryRepository: Repository<CourseCategory>,
  ) {}

  findAllQuery(
    findAllCourseCategoriesDto: FindAllCourseCategoriesDto,
  ): SelectQueryBuilder<CourseCategory> {
    const { loadMenu, name, countCourses } = findAllCourseCategoriesDto;

    let query = this.courseCategoryRepository
      .createQueryBuilder(courseCategoryName)
      .where(`${courseCategoryName}.isActive = true`)
      .leftJoin(
        `${courseCategoryName}.${courseSubcategoryEntityName}`,
        `${courseSubcategoryEntityName}`,
        `${courseSubcategoryEntityName}.isActive = true`,
      )
      .select(`${courseCategoryName}.id`);

    if (name) {
      query = query.andWhere(`${courseCategoryName}.name = %:name%`, { name });
    }

    if (loadMenu) {
      query = query.addSelect([
        `${courseSubcategoryEntityName}.id`,
        `${courseSubcategoryEntityName}.name`,
      ]);
    }

    if (countCourses) {
      query = query
        .addSelect([`${courseSubcategoryEntityName}.id`])
        .loadRelationCountAndMap(
          `${courseCategoryName}.countCourses`,
          `${courseSubcategoryEntityName}.${courseEntityName}`,
          `${courseEntityName}`,
          (qb) =>
            qb.andWhere(
              `${courseEntityName}.isActive = true AND ${courseEntityName}.publish = :published`,
              {
                published: ECoursePublish.Published,
              },
            ),
        );
    }

    return query;
  }

  async findMany(findManyCourseCategoriesDto: FindManyCourseCategoriesDto) {
    const query = this.findAllQuery(findManyCourseCategoriesDto).addSelect([
      `${courseCategoryName}.name`,
      `${courseCategoryName}.icon`,
      `${courseCategoryName}.orderPosition`,
      `${courseSubcategoryEntityName}.name`,
    ]);

    const courseCategories = await query.getMany();

    if (findManyCourseCategoriesDto.countCourses) {
      return courseCategories.map((courseCategory) => {
        return {
          ...courseCategory,
          countCourses: courseCategory.courseSubcategory?.reduce(
            (prevItem, currentItem) =>
              prevItem + (currentItem.countCourses || 0),
            0,
          ),
        };
      });
    }

    return courseCategories;
  }

  public async count(findAllCourseCategoriesDto: FindAllCourseCategoriesDto) {
    const query = this.findAllQuery(findAllCourseCategoriesDto);

    const count = await query.getCount();

    return count;
  }

  async findOneById(id: number) {
    const query = this.courseCategoryRepository
      .createQueryBuilder(courseCategoryName)
      .leftJoin(
        `${courseCategoryName}.${courseSubcategoryEntityName}`,
        `${courseSubcategoryEntityName}`,
        `${courseSubcategoryEntityName}.isActive = true`,
      )
      .addSelect([
        `${courseSubcategoryEntityName}.id`,
        `${courseSubcategoryEntityName}.name`,
      ])
      .where(`${courseCategoryName}.isActive = true`)
      .andWhere(`${courseCategoryName}.id = :id`, { id });

    return query.getOne();
  }

  async findOneOrFailById(id: number) {
    const found = await this.findOneById(id);

    handleFindOne(found, Messages.courseCategory.name);

    return found;
  }
}
