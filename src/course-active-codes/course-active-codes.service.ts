import { Injectable } from '@nestjs/common';
import { CreateCourseActiveCodeDto } from './dto/create-course-active-code.dto';
import { UpdateCourseActiveCodeDto } from './dto/update-course-active-code.dto';

@Injectable()
export class CourseActiveCodesService {
  create(createCourseActiveCodeDto: CreateCourseActiveCodeDto) {
    return 'This action adds a new courseActiveCode';
  }

  findAll() {
    return `This action returns all courseActiveCodes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} courseActiveCode`;
  }

  update(id: number, updateCourseActiveCodeDto: UpdateCourseActiveCodeDto) {
    return `This action updates a #${id} courseActiveCode`;
  }

  remove(id: number) {
    return `This action removes a #${id} courseActiveCode`;
  }
}
