import { CommonEntity } from 'src/commons/entities';
import { entityUtils } from 'src/commons/utils/entities.util';
import { CourseSubcategory } from 'src/course-subcategories/entities/course-subcategory.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class CourseCategory extends CommonEntity {
  @Column({ type: 'varchar', length: 500, nullable: false, unique: true })
  name: string;

  @Column({ type: 'integer', nullable: false, default: 999 })
  orderPosition: number;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    default: 'question',
  })
  icon: string;

  @OneToMany(
    () => CourseSubcategory,
    (courseSubcategory) => courseSubcategory.courseCategory,
  )
  courseSubcategory: CourseSubcategory[];

  public constructor(init?: Partial<CourseCategory>) {
    super();

    Object.assign(this, init);
  }
}

export const courseCategoryName = entityUtils.getEntityName(CourseCategory);
