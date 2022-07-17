import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import _ from 'lodash';
import { CoursesService } from 'src/courses/courses.service';
import { Repository } from 'typeorm';
import { CreateActivationCodeDto } from './dto/create-activation-code.dto';
import { UpdateActivationCodeDto } from './dto/update-activation-code.dto';
import { ActivationCode } from './entities/activation-code.entity';

@Injectable()
export class ActivationCodesService {
  constructor(
    @InjectRepository(ActivationCode)
    private readonly activationCodeRepository: Repository<ActivationCode>,
    private readonly coursesService: CoursesService,
  ) {}

  create(createActivationCodeDto: CreateActivationCodeDto) {
    const { courseId } = createActivationCodeDto;

    // if (_.isArray(courseId)) {
    //   const courses = this.coursesService.findAllQuery()
    // } else {
    // }

    function makeid(length) {
      let result = '';
      const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const charactersLength = characters.length;
      for (let i = 0; i < length; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * charactersLength),
        );
      }
      return result;
    }
    return 'This action adds a new activationCode';
  }

  findAll() {
    return `This action returns all activationCodes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} activationCode`;
  }

  update(id: number, updateActivationCodeDto: UpdateActivationCodeDto) {
    return `This action updates a #${id} activationCode`;
  }

  remove(id: number) {
    return `This action removes a #${id} activationCode`;
  }
}
