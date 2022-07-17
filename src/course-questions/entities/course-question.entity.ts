import { CommonEntity } from 'src/commons/entities';
import { entityUtils } from 'src/commons/utils/entities.util';
import { CourseAnswer } from 'src/course-answers/entities/course-answer.entity';
import { Course } from 'src/courses/entities/course.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class CourseQuestion extends CommonEntity {
  @Column({ type: 'varchar', nullable: false })
  content: string;

  @ManyToOne(() => Course, { nullable: false })
  @JoinColumn()
  course: Course;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn()
  user: User;

  @OneToMany(() => CourseAnswer, (courseAnswer) => courseAnswer.courseQuestion)
  courseAnswer: CourseAnswer[];

  constructor(init?: Partial<CourseQuestion>) {
    super();

    Object.assign(this, init);
  }
}

export const courseQuestionEntityName =
  entityUtils.getEntityName(CourseQuestion);
