import { CommonEntity } from 'src/commons/entities';
import { entityUtils } from 'src/commons/utils/entities.util';
import { CourseCategory } from 'src/course-categories/entities/course-category.entity';
import { Course } from 'src/courses/entities/course.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class CourseSubcategory extends CommonEntity {
  @Column({ type: 'varchar', length: 500, nullable: false })
  name: string;

  @Column({ type: 'integer', nullable: true })
  orderPosition?: number;

  @OneToMany(() => Course, (course) => course.courseSubcategory)
  course: Course[];

  @ManyToOne(
    () => CourseCategory,
    // (courseCategory) => courseCategory.courseSubcategories,
    { nullable: false },
  )
  @JoinColumn()
  courseCategory: CourseCategory;

  countCourses?: number;

  public constructor(init?: Partial<CourseSubcategory>) {
    super();

    Object.assign(this, init);
  }
}

export const courseSubcategoryEntityName =
  entityUtils.getEntityName(CourseSubcategory);
