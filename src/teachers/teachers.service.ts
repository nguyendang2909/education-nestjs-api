import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Messages, messagesService } from 'src/commons/messages';
import { entityUtils } from 'src/commons/utils/entities.util';
import { ECoursePublish } from 'src/courses/courses.type';
import { courseEntityName } from 'src/courses/entities/course.entity';
import { User, userEntityName } from 'src/users/entities/user.entity';
import { ERole } from 'src/users/users.enum';
import { UsersUtil } from 'src/users/users.util';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  FindAllTeachersDto,
  FindManyTeachersDto,
  FindOneTeacherConditions,
} from './dto/find-teacher.dto';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(User)
    private readonly teachersRepository: Repository<User>,
    private readonly usersUtil: UsersUtil,
  ) {}

  async findMany(findManyTeachersDto: FindManyTeachersDto): Promise<User[]> {
    const { currentPage, pageSize, ...findAllTeacherDto } = findManyTeachersDto;

    let query = this.findAllQuery(findAllTeacherDto);

    const { take, skip } = entityUtils.getPagination({
      currentPage,
      pageSize,
    });

    query = query
      .addSelect([
        `${userEntityName}.fullname`,
        `${userEntityName}.title`,
        `${userEntityName}.avatarURL`,
        `${userEntityName}.facebookFullname`,
        `${userEntityName}.facebookAvatarURL`,
        `${userEntityName}.googleFullname`,
        `${userEntityName}.googleAvatarURL`,
      ])
      .take(take)
      .skip(skip);

    const found = await query.getMany();

    return this.usersUtil.parseAll(found);
  }

  async count(findAllTeachersDto: FindAllTeachersDto): Promise<number> {
    const query = this.findAllQuery(findAllTeachersDto);

    const count = await query.getCount();

    return count;
  }

  async findOneOrFailById(id: number): Promise<User> {
    const query = this.findOneQuery({ id });

    const findUser = await query
      .addSelect([
        `${userEntityName}.fullname`,
        `${userEntityName}.title`,
        `${userEntityName}.avatarURL`,
        `${userEntityName}.createdAt`,
        `${userEntityName}.updatedAt`,
        `${userEntityName}.address`,
        `${userEntityName}.title`,
        `${userEntityName}.experience`,
        `${userEntityName}.description`,
        `${userEntityName}.avatarURL`,
        `${userEntityName}.gender`,
        `${userEntityName}.facebookFullname`,
        `${userEntityName}.facebookAvatarURL`,
        `${userEntityName}.googleFullname`,
        `${userEntityName}.googleAvatarURL`,
      ])
      .getOne();

    if (!findUser) {
      throw new NotFoundException(
        messagesService.setNotFound(Messages.user.teacher),
      );
    }

    return this.usersUtil.parse(findUser);
  }

  findQuery(): SelectQueryBuilder<User> {
    const query = this.teachersRepository
      .createQueryBuilder(userEntityName)
      .where(`${userEntityName}.isActive = true`)
      .andWhere(`${userEntityName}.role = :role`, { role: ERole.Teacher })
      .select(`${userEntityName}.id`);

    return query;
  }

  findAllQuery(
    findAllTeachersDto: FindAllTeachersDto,
  ): SelectQueryBuilder<User> {
    const query = this.findQuery();

    return query;
  }

  findOneQuery(
    findOneTeacherConditions: FindOneTeacherConditions,
  ): SelectQueryBuilder<User> {
    const { id } = findOneTeacherConditions;

    let query = this.findQuery();

    if (id) {
      query = query
        .andWhere(`${userEntityName}.id = :id`, { id })
        .loadRelationCountAndMap(
          `${userEntityName}.countCourses`,
          `${userEntityName}.${courseEntityName}`,
          `${courseEntityName}`,
          (qb) =>
            qb.andWhere(
              `${courseEntityName}.isActive = true AND ${courseEntityName}.publish = :published AND ${courseEntityName}.userId = :userId`,
              {
                published: ECoursePublish.Published,
                userId: id,
              },
            ),
        );
    }

    return query;
  }
}
