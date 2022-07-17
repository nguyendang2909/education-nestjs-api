import { CommonEntity } from 'src/commons/entities';
import { entityUtils } from 'src/commons/utils/entities.util';
import { Course } from 'src/courses/entities/course.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Cart extends CommonEntity {
  @ManyToOne(() => Course, { nullable: false })
  @JoinColumn()
  course: Course;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn()
  user: User;

  public constructor(init?: Partial<Cart>) {
    super();

    Object.assign(this, init);
  }
}

export const cartEntityName = entityUtils.getEntityName(Cart);
