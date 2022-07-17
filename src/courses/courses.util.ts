import { Injectable } from '@nestjs/common';
import { UsersUtil } from 'src/users/users.util';
import { Course } from './entities/course.entity';

@Injectable()
export class CoursesUtil {
  constructor(private readonly usersUtil: UsersUtil) {}

  parse(course: Course): Course {
    const { user } = course;

    if (user) {
      course.user = this.usersUtil.parse(user);
    }

    return course;
  }

  parseAll(courses: Course[]): Course[] {
    return courses.map((course) => this.parse(course));
  }
}
