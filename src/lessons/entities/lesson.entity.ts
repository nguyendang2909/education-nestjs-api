import { CommonEntity } from 'src/commons/entities';
import { EVideoProcessingStatus } from 'src/commons/enums';
import { entityUtils } from 'src/commons/utils/entities.util';
import { CoursePart } from 'src/course-parts/entities/course-part.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import {
  LESSON_NAME_MAX_LENGTH,
  LESSON_VIDEO_URL_MAX_LENGTH,
} from '../lessons.config';
import { ELessonType } from '../lessons.enum';

@Entity()
export class Lesson extends CommonEntity {
  @Column({ type: 'varchar', length: LESSON_NAME_MAX_LENGTH, nullable: false })
  name: string;

  @Column({ type: 'enum', enum: ELessonType, nullable: false })
  type: ELessonType;

  @Column({
    type: 'varchar',
    length: LESSON_VIDEO_URL_MAX_LENGTH,
    nullable: true,
  })
  videoURL?: string;

  @Column({ type: 'boolean', nullable: false, default: false })
  trial: boolean;

  @ManyToOne(() => CoursePart, { nullable: false })
  @JoinColumn()
  coursePart: CoursePart;

  @Column({ type: 'integer', nullable: false, default: 999 })
  orderPosition: number;

  @Column({
    type: 'enum',
    enum: EVideoProcessingStatus,
    nullable: false,
    default: EVideoProcessingStatus.None,
  })
  processingStatus: EVideoProcessingStatus;

  @Column({ type: 'float', nullable: true })
  duration?: number;

  order?: number;

  public constructor(init?: Partial<Lesson>) {
    super();

    Object.assign(this, init);
  }
}

export const lessonEntityName = entityUtils.getEntityName(Lesson);
