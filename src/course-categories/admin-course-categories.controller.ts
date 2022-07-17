import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequireRoles } from 'src/commons/decorators';
import { ParamsWithId } from 'src/commons/dtos';
import { ERole } from 'src/users/users.enum';
import { AdminCourseCategoriesService } from './admin-course-categories.service';
import {
  AFindAllCourseCategoriesDto,
  AFindManyCourseCategoriesDto,
} from './dto/admin-find-course-categories.dto';
import { AUpdateCourseCategoryDto } from './dto/admin-update-course-category.dto';
import { CreateCourseCategoryDto } from './dto/create-course-category.dto';

@Controller('admin/course-categories')
@ApiTags('admin/course-categories')
export class AdminCourseCategoriesController {
  constructor(
    private readonly adminCourseCategoriesService: AdminCourseCategoriesService,
  ) {}

  @Post()
  @RequireRoles([ERole.Admin])
  private async create(
    @Body() createCourseCategoryDto: CreateCourseCategoryDto,
  ) {
    return {
      type: 'adminCreateCourseCategory',
      data: await this.adminCourseCategoriesService.create(
        createCourseCategoryDto,
      ),
    };
  }

  @Get()
  @RequireRoles([ERole.Admin])
  private async findMany(
    @Query() aFindManyCourseCategoriesDto: AFindManyCourseCategoriesDto,
  ) {
    return {
      type: 'courseCategories',
      data: await this.adminCourseCategoriesService.findMany(
        aFindManyCourseCategoriesDto,
      ),
    };
  }

  @Get('/count')
  @RequireRoles([ERole.Admin])
  private async count(
    @Query() afindAllCourseCategoriesDto: AFindAllCourseCategoriesDto,
  ) {
    return {
      type: 'courseCategories',
      data: await this.adminCourseCategoriesService.count(
        afindAllCourseCategoriesDto,
      ),
    };
  }

  @Get(':id')
  @RequireRoles([ERole.Admin])
  private async findOneOrFailById(@Param() params: ParamsWithId) {
    return {
      type: 'courseCategory',
      data: await this.adminCourseCategoriesService.findOneOrFailById(
        +params.id,
      ),
    };
  }

  @Patch(':id')
  @RequireRoles([ERole.Admin])
  private async update(
    @Param() params: ParamsWithId,
    @Body() aUpdateCourseCategoryDto: AUpdateCourseCategoryDto,
  ) {
    return {
      type: 'updateCourseCategory',
      data: await this.adminCourseCategoriesService.update(
        +params.id,
        aUpdateCourseCategoryDto,
      ),
    };
  }
}
