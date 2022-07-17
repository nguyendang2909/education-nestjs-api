import { Cart } from 'src/carts/entities/cart.entity';
import { CommonEntity } from 'src/commons/entities';
import { EVideoProcessingStatus } from 'src/commons/enums';
import { entityUtils } from 'src/commons/utils/entities.util';
import { CoursePart } from 'src/course-parts/entities/course-part.entity';
import { CourseQuestion } from 'src/course-questions/entities/course-question.entity';
import { CourseRating } from 'src/course-ratings/entities/course-rating.entity';
import { CourseSubcategory } from 'src/course-subcategories/entities/course-subcategory.entity';
import { OrderItem } from 'src/order-items/entities/order-item.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ECoursePublish } from '../courses.type';

@Entity()
export class Course extends CommonEntity {
  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @ManyToOne(() => CourseSubcategory, { nullable: false })
  @JoinColumn()
  courseSubcategory: CourseSubcategory;

  @Column({ type: 'varchar', length: '500', nullable: true })
  subTitle?: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn()
  user: User;

  @Column({ type: 'varchar', nullable: true })
  coverImageURL?: string;

  @Column({ type: 'varchar', nullable: true })
  bannerURL?: string;

  @Column({ type: 'varchar', nullable: true })
  introductionVideoURL?: string;

  @Column({
    type: 'enum',
    enum: EVideoProcessingStatus,
    nullable: false,
    default: EVideoProcessingStatus.None,
  })
  introductionVideoProcessingStatus: EVideoProcessingStatus;

  @Column({ type: 'text', nullable: true })
  about?: string;

  @OneToMany(() => CoursePart, (coursePart) => coursePart.course)
  coursePart: CoursePart[];

  @Column({ type: 'integer', nullable: false, default: 0 })
  price: number;

  @Column({ type: 'integer', nullable: true })
  promotionPrice?: number;

  @Column({ type: 'integer', nullable: true })
  duration?: number;

  @Column({ type: 'boolean', nullable: false, default: false })
  certificate: boolean;

  // @Column({ type: 'date', nullable: true })
  // promotionStartTime?: Date;

  // @Column({ type: 'date', nullable: true })
  // promotionEndTime?: Date;

  @Column({
    type: 'enum',
    enum: ECoursePublish,
    nullable: false,
    default: ECoursePublish.NotPublished,
  })
  publish: ECoursePublish;

  @Column({ type: 'text', nullable: true })
  output?: string;

  @OneToMany(() => Cart, (cart) => cart.course)
  cart: Cart[];

  @OneToMany(() => CourseRating, (courseRating) => courseRating.course)
  courseRating: CourseRating[];

  @OneToMany(() => CourseQuestion, (courseQuestion) => courseQuestion.course)
  courseQuestion: CourseQuestion[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.course)
  orderItem: OrderItem[];

  purchase?: Cart;

  rating?: CourseRating;

  countStudents?: number;

  countQuestions?: number;

  countRatings?: number;

  averageRatings?: number;

  public constructor(init?: Partial<Course>) {
    super();

    Object.assign(this, init);
  }
}

export const courseEntityName = entityUtils.getEntityName(Course);
