import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { handleDeleteOne } from 'src/commons/record-handlers';
import { CourseQuestionsService } from 'src/course-questions/course-questions.service';
import { CourseQuestion } from 'src/course-questions/entities/course-question.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateCourseAnswerDto } from './dto/create-course-answer.dto';
import { CourseAnswer } from './entities/course-answer.entity';

@Injectable()
export class CourseAnswersService {
  constructor(
    @InjectRepository(CourseAnswer)
    private readonly courseAnswerRepository: Repository<CourseAnswer>,
    @Inject(forwardRef(() => CourseQuestionsService))
    private readonly courseQuestionsService: CourseQuestionsService,
  ) {}

  async create(createCourseAnswerDto: CreateCourseAnswerDto, userId: number) {
    const { courseQuestionId, ...createDto } = createCourseAnswerDto;

    await this.courseQuestionsService.findOneOrFailById(
      courseQuestionId,
      userId,
    );

    const createOptions = new CourseAnswer({
      ...createDto,
      courseQuestion: new CourseQuestion({
        isActive: true,
        id: courseQuestionId,
      }),
      user: new User({ isActive: true, id: userId }),
    });

    const created = await this.courseAnswerRepository.save(createOptions);

    return created;
  }

  async remove(id: number, userId: number) {
    const findConditions = new CourseAnswer({
      isActive: true,
      id: id,
      user: new User({ id: userId, isActive: true }),
    });

    const deleted = await this.courseAnswerRepository.update(findConditions, {
      isActive: false,
    });

    return handleDeleteOne(deleted);
  }
}
