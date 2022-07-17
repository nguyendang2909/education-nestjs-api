import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EBooleanString } from 'src/commons/enums';
import { Messages } from 'src/commons/messages';
import { handleFindOne } from 'src/commons/record-handlers';
import {
  CourseCategory,
  courseCategoryName,
} from 'src/course-categories/entities/course-category.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  AFindAllCourseSubcategoriesDto,
  AFindManyCourseSubcategoriesDto,
} from './dto/admin-find-course-subcategories.dto';
import { AUpdateCourseSubcategoryDto } from './dto/admin-update-course-subcategory.dto';
import { CreateCourseSubcategoryDto } from './dto/create-course-subcategory.dto';
import { FindOneCourseSubcategoryConditions } from './dto/find-course-subcategories.dto';
import {
  CourseSubcategory,
  courseSubcategoryEntityName,
} from './entities/course-subcategory.entity';

@Injectable()
export class AdminCourseSubcategoriesService {
  constructor(
    @InjectRepository(CourseSubcategory)
    private readonly courseSubcategoryRepository: Repository<CourseSubcategory>,
  ) {}

  async create(createCourseSubcategoryDto: CreateCourseSubcategoryDto) {
    const { courseCategoryId, ...createDto } = createCourseSubcategoryDto;

    const courseCategory = new CourseCategory();

    courseCategory.id = courseCategoryId;

    const createOptions = new CourseSubcategory({
      ...createDto,
      courseCategory,
    });

    const created = await this.courseSubcategoryRepository.save(createOptions);

    return created;
  }

  async findMany(
    aAFindManyCourseSubcategoriesDto: AFindManyCourseSubcategoriesDto,
  ) {
    const { sortCreatedAt, sortName, sortOrderPosition, ...findDto } =
      aAFindManyCourseSubcategoriesDto;

    let query = this.findAllQuery(findDto);

    if (sortOrderPosition) {
      query = query.addOrderBy(
        `${courseSubcategoryEntityName}.orderPosition`,
        sortOrderPosition,
      );
    }

    if (sortCreatedAt) {
      query = query.addOrderBy(
        `${courseSubcategoryEntityName}.createdAt`,
        sortCreatedAt,
      );
    }

    if (sortName) {
      query = query.addOrderBy(`${courseSubcategoryEntityName}.name`, sortName);
    }

    const result = query.getMany();

    return result;
  }

  async findOneOrFailById(id: number) {
    const query = this.findOneQuery({ id });

    const found = await query.getOne();

    return handleFindOne(found, Messages.courseSubcategory.name);
  }

  async update(
    id: number,
    aUpdateCourseSubcategoryDto: AUpdateCourseSubcategoryDto,
  ) {
    const { courseCategoryId, ...updateDto } = aUpdateCourseSubcategoryDto;

    const findConditions = {
      id,
    };

    const updateOptions = new CourseSubcategory({
      id,
      ...updateDto,
    });

    if (courseCategoryId) {
      const courseCategory = new CourseCategory();

      courseCategory.id = courseCategoryId;

      updateOptions.courseCategory = courseCategory;
    }

    const updated = await this.courseSubcategoryRepository.update(
      findConditions,
      updateOptions,
    );

    return updated;
  }

  findQuery(): SelectQueryBuilder<CourseSubcategory> {
    return this.courseSubcategoryRepository.createQueryBuilder(
      courseSubcategoryEntityName,
    );
  }

  findAllQuery(
    aFindAllCourseSubcategoriesDto: AFindAllCourseSubcategoriesDto,
  ): SelectQueryBuilder<CourseSubcategory> {
    const { courseCategoryId, name, isActive } = aFindAllCourseSubcategoriesDto;

    const query = this.courseSubcategoryRepository
      .createQueryBuilder(courseSubcategoryEntityName)
      .innerJoin(
        `${courseSubcategoryEntityName}.${courseCategoryName}`,
        `${courseCategoryName}`,
      );

    if (courseCategoryId) {
      query.andWhere(`${courseCategoryName}.id = :courseCategoryId`, {
        courseCategoryId,
      });
    }

    if (name) {
      query.andWhere(`${courseSubcategoryEntityName}.name LIKE %:name%`, {
        name,
      });
    }

    if (isActive) {
      query.andWhere(`${courseSubcategoryEntityName}.isActive = :isActive`, {
        isActive: isActive === EBooleanString.True,
      });
    }

    return query;
  }

  findOneQuery(
    findOneCourseSubcategoryConditions: FindOneCourseSubcategoryConditions,
  ) {
    const { id } = findOneCourseSubcategoryConditions;

    const query = this.findQuery().andWhere(
      `${courseSubcategoryEntityName}.id = :id`,
      { id },
    );

    return query;
  }
}
