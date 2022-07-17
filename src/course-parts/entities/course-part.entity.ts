import { CommonEntity } from 'src/commons/entities';
import { entityUtils } from 'src/commons/utils/entities.util';
import { Course } from 'src/courses/entities/course.entity';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class CoursePart extends CommonEntity {
  @Column({ type: 'varchar', length: 1000, nullable: false })
  name: string;

  @Column({ type: 'integer', nullable: false, default: 999 })
  orderPosition: number;

  @ManyToOne(() => Course, { nullable: false })
  @JoinColumn()
  course: Course;

  @OneToMany(() => Lesson, (lesson) => lesson.coursePart)
  lesson: Lesson[];
  // lectures: Lecture[];

  order?: number;

  public constructor(init?: Partial<CoursePart>) {
    super();

    Object.assign(this, init);
  }
}

export const coursePartEntityName = entityUtils.getEntityName(CoursePart);
