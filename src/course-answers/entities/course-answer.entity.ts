import { CommonEntity } from 'src/commons/entities';
import { entityUtils } from 'src/commons/utils/entities.util';
import { CourseQuestion } from 'src/course-questions/entities/course-question.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class CourseAnswer extends CommonEntity {
  @Column({ type: 'varchar', nullable: false })
  content: string;

  @ManyToOne(() => CourseQuestion, { nullable: false })
  @JoinColumn()
  courseQuestion: CourseQuestion;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn()
  user: User;

  constructor(init?: Partial<CourseAnswer>) {
    super();

    Object.assign(this, init);
  }
}

export const courseAnswerEntityName = entityUtils.getEntityName(CourseAnswer);
