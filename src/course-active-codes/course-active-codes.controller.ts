import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CourseActiveCodesService } from './course-active-codes.service';
import { CreateCourseActiveCodeDto } from './dto/create-course-active-code.dto';
import { UpdateCourseActiveCodeDto } from './dto/update-course-active-code.dto';

@Controller('course-active-codes')
export class CourseActiveCodesController {
  constructor(
    private readonly courseActiveCodesService: CourseActiveCodesService,
  ) {}

  @Post()
  create(@Body() createCourseActiveCodeDto: CreateCourseActiveCodeDto) {
    return this.courseActiveCodesService.create(createCourseActiveCodeDto);
  }

  @Get()
  findAll() {
    return this.courseActiveCodesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseActiveCodesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCourseActiveCodeDto: UpdateCourseActiveCodeDto,
  ) {
    return this.courseActiveCodesService.update(+id, updateCourseActiveCodeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseActiveCodesService.remove(+id);
  }
}
