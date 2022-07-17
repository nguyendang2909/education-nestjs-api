import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsPublic } from 'src/commons/decorators';
import { ParamsWithId } from 'src/commons/dtos';
import { CourseCategoriesService } from './course-categories.service';
import { FindManyCourseCategoriesDto } from './dto/find-all-course-categories.dto';

@Controller('course-categories')
@ApiTags('course-categories')
export class CourseCategoriesController {
  constructor(
    private readonly courseCategoriesService: CourseCategoriesService,
  ) {}

  @Get()
  @IsPublic()
  async findMany(
    @Query() findManyCourseCategoriesDto: FindManyCourseCategoriesDto,
  ) {
    return {
      type: 'courseCategories',
      data: await this.courseCategoriesService.findMany(
        findManyCourseCategoriesDto,
      ),
    };
  }

  @Get(':id')
  @IsPublic()
  async findOneOrFailById(@Param() params: ParamsWithId) {
    return {
      type: 'courseCategory',
      data: await this.courseCategoriesService.findOneOrFailById(+params.id),
    };
  }
}
