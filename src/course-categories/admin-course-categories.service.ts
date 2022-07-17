import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EBooleanString } from 'src/commons/enums';
import { Messages } from 'src/commons/messages';
import { handleFindOne } from 'src/commons/record-handlers';
import { courseSubcategoryEntityName } from 'src/course-subcategories/entities/course-subcategory.entity';
import { ECoursePublish } from 'src/courses/courses.type';
import { courseEntityName } from 'src/courses/entities/course.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  AFindAllCourseCategoriesDto,
  AFindManyCourseCategoriesDto,
  AFindOneCourseCategoryConditions,
} from './dto/admin-find-course-categories.dto';
import { AUpdateCourseCategoryDto } from './dto/admin-update-course-category.dto';
import { CreateCourseCategoryDto } from './dto/create-course-category.dto';
import {
  CourseCategory,
  courseCategoryName,
} from './entities/course-category.entity';

@Injectable()
export class AdminCourseCategoriesService {
  constructor(
    @InjectRepository(CourseCategory)
    private readonly courseCategoryRepository: Repository<CourseCategory>,
  ) {}

  public async create(createCourseCategoryDto: CreateCourseCategoryDto) {
    const createDto = { ...createCourseCategoryDto };

    const createOptions = new CourseCategory(createDto);

    const created = await this.courseCategoryRepository.save(createOptions);

    return created;
  }

  public async findMany(
    adminFindManyCourseCategoriesDto: AFindManyCourseCategoriesDto,
  ) {
    const { sortName, sortCreatedAt, ...findDto } =
      adminFindManyCourseCategoriesDto;

    let query = this.findAllQuery(findDto);

    if (sortName) {
      query = query.addOrderBy(`${courseCategoryName}.name`, sortName);
    }

    if (sortCreatedAt) {
      query = query.addOrderBy(
        `${courseCategoryName}.createdAt`,
        sortCreatedAt,
      );
    }

    const courseCategories = await query.getMany();

    if (adminFindManyCourseCategoriesDto.countCourses) {
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

  public async count(aFindAllCourseCategoriesDto: AFindAllCourseCategoriesDto) {
    const query = this.findAllQuery(aFindAllCourseCategoriesDto);

    const result = await query.getCount();

    return result;
  }

  public async findOneOrFailById(id: number) {
    const query = this.findOneQuery({ id });

    const found = query.getOne();

    return handleFindOne(found, Messages.courseCategory.name);
  }

  public async update(
    id: number,
    aUpdateCourseCategoryDto: AUpdateCourseCategoryDto,
  ) {
    const findConditions = { id };

    const updateOptions = new CourseCategory({
      ...aUpdateCourseCategoryDto,
    });

    const updated = await this.courseCategoryRepository.update(
      findConditions,
      updateOptions,
    );

    return updated;
  }

  public findQuery() {
    const query = this.courseCategoryRepository
      .createQueryBuilder(courseCategoryName)
      .leftJoin(
        `${courseCategoryName}.${courseSubcategoryEntityName}`,
        `${courseSubcategoryEntityName}`,
        // `${courseSubcategoryName}.isActive = true`,
      );

    return query;
  }

  public findAllQuery(
    findAllCourseCategoriesDto: AFindAllCourseCategoriesDto,
  ): SelectQueryBuilder<CourseCategory> {
    const { id, name, countCourses, isActive } = findAllCourseCategoriesDto;

    let query = this.findQuery();

    if (id) {
      query = query.andWhere(`${courseCategoryName}.id LIKE :id`, {
        id: `%${id}%`,
      });
    }

    if (name) {
      query = query.andWhere(`${courseCategoryName}.name LIKE :name`, {
        name: `%${name}%`,
      });
    }

    if (isActive) {
      query = query.andWhere(`${courseCategoryName}.isActive = :isActive`, {
        isActive: isActive === EBooleanString.True ? true : false,
      });
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

  public findOneQuery(
    findOneCourseCategoryConditions: AFindOneCourseCategoryConditions,
  ): SelectQueryBuilder<CourseCategory> {
    const { id } = findOneCourseCategoryConditions;

    const query = this.findQuery().andWhere(`${courseCategoryName}.id = :id`, {
      id,
    });

    return query;
  }
}
