import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User, userEntityName } from './entities/user.entity';
import bcrypt from 'bcrypt';
import { ERegisterTeacher } from './users.enum';
import { handleFindOne, handleUpdateOne } from 'src/commons/record-handlers';
import { FacebookUser, UserWithoutPassword } from './users.type';
import { Messages, messagesService } from 'src/commons/messages';
import { UpdateCurrentUserDto } from './dto/update-user.dto';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { FileManagerService } from 'src/file-manager/file-manager.service';
import { FindOneUserConditions } from './dto/find-user.dto';
import { UsersUtil } from './users.util';
import _ from 'lodash';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly usersUtil: UsersUtil,
    private readonly fileManagerService: FileManagerService,
    private readonly configService: ConfigService,
  ) {}

  async save(user: Partial<User>): Promise<User> {
    return await this.usersRepository.save(user);
  }

  async create(createUserDto: CreateUserDto): Promise<UserWithoutPassword> {
    const { password, ...createDto } = createUserDto;

    const existUser = await this.findOneQuery({
      email: createUserDto.email,
    }).getOne();

    if (existUser) {
      throw new ConflictException(
        messagesService.setConflict(Messages.user.name),
      );
    }

    const hashPassword = await this.hashPassword(password);

    const createOptions = new User({
      ...createDto,
      password: hashPassword,
      createdBy: 1,
      updatedBy: 1,
    });

    const created = await this.usersRepository.save(createOptions);

    delete created.password;

    return this.usersUtil.parse(created);
  }

  async createFromFacebook(
    facebookUser: FacebookUser,
  ): Promise<UserWithoutPassword> {
    const createOptions = this.usersRepository.create({
      ...facebookUser,
      createdBy: 1,
      updatedBy: 1,
    });

    const created = await this.usersRepository.save(createOptions);

    delete created.password;

    return created;
  }

  // async createFromGoogle(googleUser: GoogleUser): Promise<UserWithoutPassword> {
  //   const createOptions = new User({
  //     createdBy: 1,
  //     updatedBy: 1,
  //     ...googleUser,
  //   });

  //   const created = await this.usersRepository.save(createOptions);

  //   delete created.password;

  //   return created;
  // }

  public async findCurrent(currentUserId: number): Promise<User> {
    const query = this.findOneQuery({ id: currentUserId }).addSelect([
      `${userEntityName}.createdAt`,
      `${userEntityName}.updatedAt`,
      `${userEntityName}.fullname`,
      `${userEntityName}.role`,
      `${userEntityName}.email`,
      `${userEntityName}.birthday`,
      `${userEntityName}.address`,
      `${userEntityName}.isVerified`,
      `${userEntityName}.title`,
      `${userEntityName}.phoneNumber`,
      `${userEntityName}.experience`,
      `${userEntityName}.description`,
      `${userEntityName}.avatarURL`,
      `${userEntityName}.gender`,
      `${userEntityName}.registerTeacher`,
      `${userEntityName}.facebookFullname`,
      `${userEntityName}.facebookId`,
      `${userEntityName}.facebookEmail`,
      `${userEntityName}.facebookAvatarURL`,
      `${userEntityName}.googleEmail`,
      `${userEntityName}.googleFullname`,
      `${userEntityName}.googleAvatarURL`,
    ]);

    const found = await query.getOne();

    if (found) {
      return this.usersUtil.parse(found);
    }

    return handleFindOne(found, Messages.user.name);
  }

  async findOneByUsername(username: string): Promise<User | undefined> {
    const query = this.findQuery()
      .andWhere(`${userEntityName}.email = :username`, {
        username,
      })
      .addSelect([
        `${userEntityName}.password`,
        `${userEntityName}.createdAt`,
        `${userEntityName}.updatedAt`,
        `${userEntityName}.fullname`,
        `${userEntityName}.role`,
        `${userEntityName}.email`,
        `${userEntityName}.birthday`,
        `${userEntityName}.address`,
        `${userEntityName}.isVerified`,
        `${userEntityName}.title`,
        `${userEntityName}.phoneNumber`,
        `${userEntityName}.experience`,
        `${userEntityName}.description`,
        `${userEntityName}.avatarURL`,
        `${userEntityName}.gender`,
        `${userEntityName}.registerTeacher`,
        `${userEntityName}.facebookFullname`,
        `${userEntityName}.facebookId`,
        `${userEntityName}.facebookEmail`,
        `${userEntityName}.facebookAvatarURL`,
        `${userEntityName}.googleEmail`,
        `${userEntityName}.googleFullname`,
        `${userEntityName}.googleAvatarURL`,
      ]);

    const found = await query.getOne();

    return found;
  }

  // async findOne(findOneUserConditions: FindOneUserConditions) {
  //   return await this.userEntityService
  //     .findOneQuery(findOneUserConditions)
  //     .getOne();
  // }

  // async findOneOrFail(findOneUserConditions: FindOneUserConditions) {
  //   const found = await this.findOne(findOneUserConditions);

  //   return handleFindOne(found);
  // }

  async update(id: number, updateOptions: Partial<User>) {
    return await this.usersRepository.update(
      { id, isActive: true },
      updateOptions,
    );
  }

  async updateCurrent(
    updateUserDto: UpdateCurrentUserDto,
    currentUserId: number,
  ) {
    const { password: currentPassword } = await this.findCurrent(currentUserId);

    const { oldPassword, password, registerTeacher, ...updateDto } =
      updateUserDto;

    const updateOptions: QueryDeepPartialEntity<User> = { ...updateDto };

    if (password && oldPassword && currentPassword) {
      if (!this.comparePassword(oldPassword, currentPassword)) {
        throw new BadRequestException(
          messagesService.setWrong(Messages.user.oldPassword),
        );
      }

      updateOptions.password = await this.hashPassword(password);
    }

    if (registerTeacher) {
      if (registerTeacher === ERegisterTeacher.accept) {
        throw new ForbiddenException();
      }

      updateOptions.registerTeacher = registerTeacher;
    }

    const updated = await this.usersRepository.update(
      { isActive: true, id: currentUserId },
      updateOptions,
    );

    return handleUpdateOne(updated, Messages.user.name);
  }

  async updateCurrentAvatar(
    file: Express.Multer.File,
    user: UserWithoutPassword,
  ) {
    const imageURL = await this.fileManagerService.uploadAvatarAsJPG({
      file: file,
      folder: 'users/avatars',
      allowPublic: true,
    });

    let result = { message: '' };

    const findConditions = {
      id: user.id,
      isActive: true,
    };

    const updateOptions = {
      avatarURL: imageURL,
      updatedBy: user.id,
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

  public async hashPassword(password: string): Promise<string> {
    console.log(this.configService.get<string>('PASSWORD_SECRET_KEY'));

    const passwordWithSecretKey =
      password + this.configService.get<string>('PASSWORD_SECRET_KEY');

    return await bcrypt.hash(passwordWithSecretKey, 10);
  }

  public comparePassword(password: string, encryptedPassword: string): boolean {
    console.log(this.configService.get<string>('PASSWORD_SECRET_KEY'));

    const passwordWithSecretKey =
      password + this.configService.get<string>('PASSWORD_SECRET_KEY');

    return bcrypt.compareSync(passwordWithSecretKey, encryptedPassword);
  }

  findQuery(): SelectQueryBuilder<User> {
    const query = this.usersRepository
      .createQueryBuilder(userEntityName)
      .where(`${userEntityName}.isActive = true`)
      .select(`${userEntityName}.id`);

    return query;
  }

  findOneQuery(
    findOneUserConditions: FindOneUserConditions,
  ): SelectQueryBuilder<User> {
    const { email, phoneNumber, id, facebookId, googleEmail } =
      findOneUserConditions;

    if (_.isEmpty(findOneUserConditions)) {
      throw new BadRequestException();
    }

    const query = this.findQuery();

    if (email) {
      query.andWhere(`${userEntityName}.email = :email`, { email });
    }

    if (phoneNumber) {
      query.andWhere(`${userEntityName}.phoneNumber = :phoneNumber`, {
        phoneNumber,
      });
    }

    if (id) {
      query.andWhere(`${userEntityName}.id = :id`, { id });
    }

    if (facebookId) {
      query.andWhere(`${userEntityName}.facebookId = :facebookId`, {
        facebookId,
      });
    }

    if (googleEmail) {
      query.andWhere(`${userEntityName}.googleEmail = :googleEmail`, {
        googleEmail,
      });
    }

    return query;
  }
}
