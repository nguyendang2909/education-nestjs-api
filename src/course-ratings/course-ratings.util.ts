import { Injectable } from '@nestjs/common';
import { UsersUtil } from 'src/users/users.util';
import { CourseRating } from './entities/course-rating.entity';

@Injectable()
export class CourseRatingsUtil {
  constructor(private readonly usersUtil: UsersUtil) {}

  parse(courseRating: CourseRating) {
    if (courseRating.user) {
      courseRating.user = this.usersUtil.parse(courseRating.user);
    }

    return courseRating;
  }

  parseAll(courseRatings: CourseRating[]) {
    return courseRatings.map((courseRating) => {
      return this.parse(courseRating);
    });
  }
}
