import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsPublic } from 'src/commons/decorators';
import { ParamsWithId } from 'src/commons/dtos';
import { CourseSubcategoriesService } from './course-subcategories.service';
import { FindAllCourseSubcategoriesDto } from './dto/find-course-subcategories.dto';

@Controller('course-subcategories')
@ApiTags('course-subcategories')
export class CourseSubcategoriesController {
  constructor(
    private readonly courseSubcategoriesService: CourseSubcategoriesService,
  ) {}

  @Get()
  @IsPublic()
  async findAll(
    @Query() findAllCourseSubcategoriesDto: FindAllCourseSubcategoriesDto,
  ) {
    return {
      type: 'courseSubcategories',
      data: await this.courseSubcategoriesService.findAll(
        findAllCourseSubcategoriesDto,
      ),
    };
  }

  // @Get()
  // async count() {
  //   return {
  //     type: 'courseSubcategoryCount',
  //     data: await this.courseSubcategoriesService.findAll(
  //       findAllCourseSubcategoriesDto,
  //     ),
  //   };
  // }

  @Get(':id')
  @IsPublic()
  async findOne(@Param() params: ParamsWithId) {
    return {
      type: 'courseSubcategory',
      data: await this.courseSubcategoriesService.findOneOrFail(+params.id),
    };
  }
}
