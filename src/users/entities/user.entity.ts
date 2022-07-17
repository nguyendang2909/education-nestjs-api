import { CommonEntity } from 'src/commons/entities';
import { entityUtils } from 'src/commons/utils/entities.util';
import { Course } from 'src/courses/entities/course.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { EGender, ERegisterTeacher, ERole } from '../users.enum';

@Entity()
export class User extends CommonEntity {
  @Column({ type: 'varchar', length: 200, nullable: true })
  fullname?: string;

  @Column({ type: 'enum', enum: ERole, nullable: false, default: ERole.Member })
  role: ERole;

  @Column({ type: 'varchar', length: 254, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  password?: string;

  @Column({ type: 'date', nullable: true })
  birthday?: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  address?: string;

  @Column({ type: 'boolean', nullable: false, default: false })
  isVerified: boolean;

  @Column({ type: 'varchar', length: 300, nullable: true })
  title?: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  phoneNumber?: string;

  @Column({ type: 'varchar', length: 500, nullable: true, unique: true })
  facebookId?: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  facebookFullname?: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  facebookAvatarURL?: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  facebookEmail?: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  facebookAccessToken?: string;

  @Column({ type: 'varchar', length: 500, nullable: true, unique: true })
  googleEmail?: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  googleFullname?: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  googleAvatarURL?: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  googleAccessToken?: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  experience?: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  avatarURL?: string;

  displayName?: string;

  displayEmail?: string;

  displayAvatarURL?: string;

  @Column({
    type: 'enum',
    enum: ERegisterTeacher,
    nullable: false,
    default: ERegisterTeacher.notRegistered,
  })
  registerTeacher: ERegisterTeacher;

  @Column({
    type: 'enum',
    enum: EGender,
    nullable: false,
    default: EGender.unknown,
  })
  gender: EGender;

  @OneToMany(() => Course, (course) => course.user)
  course: Course[];

  countCourses?: number;

  public constructor(init?: Partial<User>) {
    super();
    Object.assign(this, init);
  }
}

export const userEntityName = entityUtils.getEntityName(User);
