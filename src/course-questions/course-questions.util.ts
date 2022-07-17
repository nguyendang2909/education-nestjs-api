import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CourseAnswersUtil } from 'src/course-answers/course-answers.util';
import { UsersUtil } from 'src/users/users.util';
import { CourseQuestion } from './entities/course-question.entity';

@Injectable()
export class CourseQuestionsUtil {
  constructor(
    private readonly usersUtil: UsersUtil,
    @Inject(forwardRef(() => CourseAnswersUtil))
    private readonly courseAnswersUtil: CourseAnswersUtil,
  ) {}

  public parse(courseQuestion: CourseQuestion): CourseQuestion {
    const { user, courseAnswer } = courseQuestion;

    if (user) {
      courseQuestion.user = this.usersUtil.parse(user);
    }

    if (courseAnswer) {
      courseQuestion.courseAnswer =
        this.courseAnswersUtil.parseAll(courseAnswer);
    }

    return courseQuestion;
  }

  public parseAll(courseQuestions: CourseQuestion[]): CourseQuestion[] {
    return courseQuestions.map((courseQuestion) => this.parse(courseQuestion));
  }
}
