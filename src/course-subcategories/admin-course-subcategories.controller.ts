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
import { AdminCourseSubcategoriesService } from './admin-course-subcategories.service';
import { AFindManyCourseSubcategoriesDto } from './dto/admin-find-course-subcategories.dto';
import { AUpdateCourseSubcategoryDto } from './dto/admin-update-course-subcategory.dto';
import { CreateCourseSubcategoryDto } from './dto/create-course-subcategory.dto';

@Controller('admin/course-subcategories')
@ApiTags('admin/course-subcategories')
export class AdminCourseSubcategoriesController {
  constructor(
    private readonly adminCourseSubcategoriesService: AdminCourseSubcategoriesService,
  ) {}

  @Post()
  @RequireRoles([ERole.Admin])
  async create(@Body() createCourseSubcategoryDto: CreateCourseSubcategoryDto) {
    return {
      type: 'createCourseSubcategory',
      data: await this.adminCourseSubcategoriesService.create(
        createCourseSubcategoryDto,
      ),
    };
  }

  @Get()
  @RequireRoles([ERole.Admin])
  async findAll(
    @Query() afindManyCourseSubcategoriesDto: AFindManyCourseSubcategoriesDto,
  ) {
    return {
      type: 'courseSubcategories',
      data: await this.adminCourseSubcategoriesService.findMany(
        afindManyCourseSubcategoriesDto,
      ),
    };
  }

  @Get(':id')
  @RequireRoles([ERole.Admin])
  async findOne(@Param() params: ParamsWithId) {
    return {
      type: 'courseSubcategory',
      data: await this.adminCourseSubcategoriesService.findOneOrFailById(
        +params.id,
      ),
    };
  }

  @Patch(':id')
  @RequireRoles([ERole.Admin])
  async update(
    @Param() params: ParamsWithId,
    @Body() aUpdateCourseSubcategoryDto: AUpdateCourseSubcategoryDto,
  ) {
    return {
      type: 'updateCourseSubcategory',
      data: await this.adminCourseSubcategoriesService.update(
        +params.id,
        aUpdateCourseSubcategoryDto,
      ),
    };
  }
}
