import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User, userEntityName } from './entities/user.entity';
import bcrypt from 'bcrypt';
import { ERegisterTeacher, ERole } from './users.enum';
import { handleFindOne, handleUpdateOne } from 'src/commons/record-handlers';
import { UserWithoutPassword } from './users.type';
import { Messages, messagesService } from 'src/commons/messages';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { FileManagerService } from 'src/file-manager/file-manager.service';
import {
  AFindAllUsersDto,
  AFindManyUsersDto,
  AFindOneUserConditions,
} from './dto/admin-find-user.dto';
import { entityUtils } from 'src/commons/utils/entities.util';
import { AUpdateUserDto } from './dto/admin-update-user.dto';

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly fileManagerService: FileManagerService,
  ) {}

  private async onApplicationBootstrap() {
    const firstUser = await this.findOneById(1);

    if (firstUser) {
      return;
    }

    const hashPassword = await this.hashPassword(
      process.env.ADMIN_PASSWORD as string,
    );

    const createFirstUserOptions = this.usersRepository.create({
      id: 1,
      fullname: 'Nguyen Dang Quynh',
      email: process.env.ADMIN_EMAIL,
      password: hashPassword,
      role: ERole.Admin,
      createdBy: 1,
      updatedBy: 1,
    });

    await this.usersRepository.save(createFirstUserOptions);
  }

  async create(createUserDto: CreateUserDto): Promise<UserWithoutPassword> {
    if (!createUserDto.phoneNumber && !createUserDto.email) {
      throw new NotFoundException('Yêu cầu nhập số điện thoại hoặc email!');
    }

    const { password, ...createDto } = createUserDto;

    let existUser: User | undefined;

    if (createUserDto.email) {
      existUser = await this.findOneByUsername(createUserDto.email);
    } else if (createUserDto.phoneNumber) {
      existUser = await this.findOneByUsername(createUserDto.phoneNumber);
    }

    if (existUser) {
      throw new ConflictException(
        messagesService.setConflict(Messages.user.name),
      );
    }

    const hashPassword = await this.hashPassword(password);

    const createOptions = this.usersRepository.create({
      ...createDto,
      password: hashPassword,
      createdBy: 1,
      updatedBy: 1,
    });

    const created = await this.usersRepository.save(createOptions);

    delete created.password;

    return created;
  }

  async findMany(findManyUsersDto: AFindManyUsersDto) {
    const { currentPage, pageSize, ...findDto } = findManyUsersDto;

    const { take, skip } = entityUtils.getPagination({
      currentPage: currentPage,
      pageSize: pageSize,
    });

    const users = await this.findAllQuery(findDto)
      .take(take)
      .skip(skip)
      .getMany();

    const usersWithoutPassword = users.map((user) => {
      delete user.password;

      return user;
    });

    return usersWithoutPassword;
  }

  async count(findUsersDto: AFindAllUsersDto): Promise<number> {
    const query = this.findAllQuery(findUsersDto);

    const result = await query.getCount();

    return result;
  }

  public async findOneById(id: number): Promise<User | undefined> {
    const query = this.findOneQuery({ id });

    const found = await query.getOne();

    return found;
  }

  public async findOneOrFailById(id: number): Promise<User> {
    const found = await this.findOneQuery({ id }).getOne();

    return handleFindOne(found, Messages.user.name);
  }

  public async findOneByUsername(username: string): Promise<User | undefined> {
    const query = this.findQuery().andWhere(
      `${userEntityName}.email = :username OR ${userEntityName}.phoneNumber = :username`,
      {
        username,
      },
    );

    const found = await query.getOne();

    return found;
  }

  async update(id: number, updateUserDto: AUpdateUserDto) {
    const { role: currentRole } = await this.findOneOrFailById(id);

    const { password, registerTeacher, role, ...updateDto } = updateUserDto;

    const updateOptions: QueryDeepPartialEntity<User> = { ...updateDto };

    if (password) {
      updateOptions.password = await this.hashPassword(password);
    }

    if (registerTeacher && currentRole !== ERole.Admin) {
      if (id === 1) {
        throw new BadRequestException('Không thể chỉnh sửa user tối thượng');
      }

      if (registerTeacher === ERegisterTeacher.accept) {
        updateOptions.registerTeacher = ERegisterTeacher.accept;

        updateOptions.role = ERole.Teacher;
      } else {
        updateOptions.registerTeacher = registerTeacher;
      }
    }

    if (role) {
      if (id === 1) {
        throw new BadRequestException('Không thể chỉnh sửa user tối thượng');
      }
      updateOptions.role = role;
    }

    const updated = await this.usersRepository.update(
      { id: id },
      updateOptions,
    );

    return handleUpdateOne(updated, Messages.user.name);
  }

  async updateAvatar(
    id: number,
    file: Express.Multer.File,
    currentUserId: number,
  ) {
    const user = await this.findOneOrFailById(id);

    const imageURL = await this.fileManagerService.uploadAvatarAsJPG({
      file: file,
      folder: 'users/avatars',
      allowPublic: true,
    });

    let result = { message: '' };

    const findConditions = new User({ id });

    const updateOptions = {
      avatarURL: imageURL,
      updatedBy: currentUserId,
    };

    try {
      const updated = await this.usersRepository.update(
        findConditions,
        updateOptions,
      );

      result = handleUpdateOne(updated);
    } catch (err) {
      this.fileManagerService.removeFile(imageURL);

      throw new InternalServerErrorException();
    }

    if (user.avatarURL) {
      this.fileManagerService.moveFileToTemp(user.avatarURL);
    }

    return result;
  }

  private async hashPassword(password: string): Promise<string> {
    const passwordWithSecretKey = password + process.env.PASSWORD_SECRET_KEY;

    return await bcrypt.hash(passwordWithSecretKey, 10);
  }

  comparePassword(password: string, encryptedPassword: string) {
    const passwordWithSecretKey = password + process.env.PASSWORD_SECRET_KEY;

    return bcrypt.compareSync(passwordWithSecretKey, encryptedPassword);
  }

  findQuery(): SelectQueryBuilder<User> {
    const query = this.usersRepository.createQueryBuilder(userEntityName);

    return query;
  }

  findAllQuery(
    findAllUserConditions: AFindAllUsersDto,
  ): SelectQueryBuilder<User> {
    const { role, email, phoneNumber, registerTeacher, isActive, fullname } =
      findAllUserConditions;

    let query = this.findQuery();

    if (isActive) {
      query = query.andWhere(`${userEntityName}.isActive = :isActive`, {
        isActive: isActive === 'true' ? true : false,
      });
    }

    if (role) {
      query = query.andWhere(`${userEntityName}.role = :role`, { role });
    }

    if (email) {
      query = query.andWhere(`${userEntityName}.email LIKE :email`, {
        email: `%${email}%`,
      });
    }

    if (fullname) {
      query = query.andWhere(`${userEntityName}.email LIKE :fullname`, {
        fullname: `%${fullname}%`,
      });
    }

    if (phoneNumber) {
      query = query.andWhere(`${userEntityName}.email LIKE :phoneNumber`, {
        phoneNumber: `%${phoneNumber}%`,
      });
    }

    if (registerTeacher) {
      query = query.andWhere(
        `${userEntityName}.registerTeacher = :registerTeacher`,
        {
          registerTeacher,
        },
      );
    }

    return query;
  }

  findOneQuery(
    aFindOneUserConditions: AFindOneUserConditions,
  ): SelectQueryBuilder<User> {
    const { id } = aFindOneUserConditions;

    const query = this.findQuery();

    if (id) {
      query.andWhere(`${userEntityName}.id = :id`, { id });
    }

    return query;
  }
}
