import { CommonEntity } from 'src/commons/entities';
import { Course } from 'src/courses/entities/course.entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class ActivationCode extends CommonEntity {
  @ManyToOne(() => Course, { nullable: false })
  @JoinColumn()
  course: Course[];
}
