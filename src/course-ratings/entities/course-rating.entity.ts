import { CommonEntity } from 'src/commons/entities';
import { entityUtils } from 'src/commons/utils/entities.util';
import { Course } from 'src/courses/entities/course.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class CourseRating extends CommonEntity {
  @Column({ type: 'integer', width: 1, nullable: false })
  rating: number;

  @Column({ type: 'varchar', nullable: true })
  comment?: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Course, { nullable: false })
  @JoinColumn()
  course: Course;

  constructor(init?: Partial<CourseRating>) {
    super();

    Object.assign(this, init);
  }
}

export const courseRatingEntityName = entityUtils.getEntityName(CourseRating);
