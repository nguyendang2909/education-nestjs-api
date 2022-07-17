import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Messages } from 'src/commons/messages';
import { handleFindOne } from 'src/commons/record-handlers';
import {
  CourseCategory,
  courseCategoryName,
} from 'src/course-categories/entities/course-category.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateCourseSubcategoryDto } from './dto/create-course-subcategory.dto';
import { FindAllCourseSubcategoriesDto } from './dto/find-course-subcategories.dto';
import { UpdateCourseSubcategoryDto } from './dto/update-course-subcategory.dto';
import {
  CourseSubcategory,
  courseSubcategoryEntityName,
} from './entities/course-subcategory.entity';

@Injectable()
export class CourseSubcategoriesService {
  constructor(
    @InjectRepository(CourseSubcategory)
    private readonly courseSubcategoryRepository: Repository<CourseSubcategory>,
  ) {}

  async create(createCourseSubcategoryDto: CreateCourseSubcategoryDto) {
    const { courseCategoryId, ...createDto } = createCourseSubcategoryDto;

    const courseCategory = new CourseCategory();

    courseCategory.id = courseCategoryId;

    const createOptions = this.courseSubcategoryRepository.create({
      ...createDto,
      courseCategory,
    });

    const created = await this.courseSubcategoryRepository.save(createOptions);

    return created;
  }

  findAllQuery(
    findAllCourseSubcategoriesDto: FindAllCourseSubcategoriesDto,
  ): SelectQueryBuilder<CourseSubcategory> {
    const { courseCategoryId, name } = findAllCourseSubcategoriesDto;
    const query = this.courseSubcategoryRepository
      .createQueryBuilder(courseSubcategoryEntityName)
      .innerJoin(
        `${courseSubcategoryEntityName}.${courseCategoryName}`,
        `${courseCategoryName}`,
        `${courseCategoryName}.isActive = true`,
      )
      .where(`${courseSubcategoryEntityName}.isActive = true`);

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

    return query;
  }

  async findAll(findAllCourseSubcategoriesDto: FindAllCourseSubcategoriesDto) {
    const query = this.findAllQuery(findAllCourseSubcategoriesDto);

    const result = query.getMany();

    return result;
  }

  async findOne(id: number) {
    return await this.courseSubcategoryRepository.findOne({
      where: {
        id,
        isActive: true,
      },
    });
  }

  async findOneOrFail(id: number) {
    const found = await this.findOne(id);

    handleFindOne(found, Messages.courseSubcategory.name);

    return found;
  }

  async update(
    id: number,
    updateCourseSubcategoryDto: UpdateCourseSubcategoryDto,
  ) {
    const { courseCategoryId, ...updateDto } = updateCourseSubcategoryDto;

    const updateOptions = this.courseSubcategoryRepository.create({
      id,
      ...updateDto,
    });

    if (courseCategoryId) {
      const courseCategory = new CourseCategory();

      courseCategory.id = courseCategoryId;

      updateOptions.courseCategory = courseCategory;
    }

    const updated = await this.courseSubcategoryRepository.save(updateOptions);

    return updated;
  }

  async remove(id: number) {
    const deleteOptions = this.courseSubcategoryRepository.create({
      id,
      isActive: false,
    });

    const deleted = await this.courseSubcategoryRepository.save(deleteOptions);

    return deleted;
  }
}
