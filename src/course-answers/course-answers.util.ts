import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CourseQuestionsUtil } from 'src/course-questions/course-questions.util';
import { UsersUtil } from 'src/users/users.util';
import { CourseAnswer } from './entities/course-answer.entity';

@Injectable()
export class CourseAnswersUtil {
  constructor(
    private readonly usersUtil: UsersUtil,
    @Inject(forwardRef(() => CourseQuestionsUtil))
    courseQuestionsUtil: CourseQuestionsUtil,
  ) {}

  parse(courseAnswer: CourseAnswer): CourseAnswer {
    const { user } = courseAnswer;

    if (user) {
      courseAnswer.user = this.usersUtil.parse(user);
    }

    return courseAnswer;
  }

  parseAll(courseAnswers: CourseAnswer[]): CourseAnswer[] {
    return courseAnswers.map((courseAnswer) => this.parse(courseAnswer));
  }
}
