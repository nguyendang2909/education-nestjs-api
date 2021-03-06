import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import bcrypt from 'bcrypt';
import { JwtPayload } from 'src/commons/types';
import {
  FacebookUser,
  GoogleUser,
  UserWithoutPassword,
} from 'src/users/users.type';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { Messages, messagesService } from 'src/commons/messages';
import { userEntityName } from 'src/users/entities/user.entity';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { ChangeForgotPasswordDto } from './dto/change-forgot-password.dto';
import _ from 'lodash';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(username, password) {
    const user = await this.usersService.findOneByUsername(username);

    if (!user || !user.password) {
      throw new UnauthorizedException(
        messagesService.setNotFound(Messages.user.name),
      );
    }

    const passwordWithSecretKey = password + process.env.PASSWORD_SECRET_KEY;

    if (!bcrypt.compareSync(passwordWithSecretKey, user.password)) {
      throw new UnauthorizedException(
        messagesService.setWrong(Messages.user.password),
      );
    }

    delete user.password;

    return user;
  }

  async register(createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService
      .findOneQuery({
        email: forgotPasswordDto.email,
      })
      .addSelect([`${userEntityName}.email`, `${userEntityName}.fullname`])
      .getOne();

    if (!user || !user.id) {
      throw new NotFoundException(
        messagesService.setNotFound(Messages.user.email),
      );
    }

    const secretKey = this.configService.get<string>(
      'JWT_FORGOT_PASSWORD_SECRET',
    );

    if (!secretKey) {
      throw new BadRequestException('Kh??ng t??m th???y secret key');
    }

    const jwt = this.jwtService.sign(
      { id: user.id },
      {
        expiresIn: '15m',
        secret: secretKey,
      },
    );

    const appDomain = this.configService.get<string>('UI_URL');

    await this.mailerService.sendMail({
      from: 'admin@leslei.com',
      to: user.email,
      subject: `L???y l???i m???t kh???u m???i tr??n ${messagesService.setText(
        Messages.app.shortTitleDomain,
      )}`,
      html: `
              <p>Ch??o ${user.fullname}</p>

              <p>B???n ho???c ai ???? v???a y??u c???u l???y l???i m???t kh???u m???i tr??n ${messagesService.setText(
                Messages.app.shortTitleDomain,
              )}

              <p>????? t???o m???t kh???u m???i, b???n h??y b???m v??o link d?????i ????y:</p>

              <p>${appDomain}/change-forgot-password?auth=${jwt}
              </p>

              <p>N???u kh??ng mu???n ?????i m???t kh???u, b???n h??y b??? qua email n??y.
              <br />
              Link n??y c?? gi?? tr??? trong 15 ph??t.
              </p>

              <p>N???u c?? v?????ng m???c g?? th??m, b???n vui l??ng li??n h??? theo th??ng tin ph??a d?????i:
              <br />- Hotline: ${Messages.app.hotline}
              <br />- Ho???c truy c???p ${appDomain} v?? chat v???i t?? v???n vi??n
              </p>

              <p>
              C???m ??n b???n ???? s??? d???ng d???ch v??? c???a Leslei.
              </p>

              <p>Tr??n tr???ng.</p>

              <p>_______________________________________</p>

              <p><b>${Messages.app.shortTitle} - H???c t??? Chuy??n gia</b></p>

              <p><b>${
                Messages.app.shortTitle
              }</b> l?? m???t h??? th???ng ????o t???o tr???c tuy???n, c???ng k???t n???i Chuy??n gia v???i H???c vi??n

              <br />S??? m???nh: chia s??? ki???n th???c, kinh nghi???m th???c t??? cho 10 tri???u ng?????i d??n Vi???t Nam</br>
              <br />?????a ch???: ${Messages.app.location} </p>
              `,
    });

    return { email: user.email };
  }

  async changeForgotPassword(
    changeForgotPasswordDto: ChangeForgotPasswordDto,
  ): Promise<UserWithoutPassword> {
    const { authJwt, password: newPassword } = changeForgotPasswordDto;

    const secretKey = this.configService.get<string>(
      'JWT_FORGOT_PASSWORD_SECRET',
    );

    if (!secretKey) {
      throw new BadRequestException('Kh??ng t??m th???y secret key');
    }

    const decodedJwt = this.jwtService.verify<{ id?: number }>(authJwt, {
      secret: secretKey,
    });

    if (!decodedJwt.id || !_.isNumber(decodedJwt.id)) {
      throw new BadRequestException();
    }

    const user = await this.usersService
      .findOneQuery({
        id: decodedJwt.id,
      })
      .addSelect([`${userEntityName}.password`])
      .getOne();

    if (!user || !user.id) {
      throw new NotFoundException(
        messagesService.setNotFound(Messages.user.name),
      );
    }

    if (
      user.password &&
      this.usersService.comparePassword(newPassword, user.password)
    ) {
      throw new BadRequestException(
        messagesService.setConflict(Messages.user.password),
      );
    }

    const hasNewPassword = await this.usersService.hashPassword(newPassword);

    await this.usersService.update(user.id, {
      password: hasNewPassword,
    });

    delete user.password;

    return user;
  }

  async getUserFromFacebook(facebookUser: FacebookUser): Promise<any> {
    const user = await this.usersService
      .findOneQuery({
        facebookId: facebookUser.facebookId,
      })
      .getOne();

    if (user) {
      await this.usersService.update(user.id, {
        ...facebookUser,
        updatedBy: user.id,
      });

      return { id: user.id };
    } else {
      const createdUser = await this.usersService.save({
        ...facebookUser,
        createdBy: 1,
        updatedBy: 1,
      });

      return { id: createdUser.id };
    }
  }

  async getUserFromGoogle(googleUser: GoogleUser): Promise<{ id: number }> {
    const user = await this.usersService
      .findOneQuery({
        googleEmail: googleUser.googleEmail,
      })
      .getOne();

    if (user) {
      await this.usersService.update(user.id, {
        ...googleUser,
        updatedBy: user.id,
      });

      return { id: user.id };
    } else {
      const createdUser = await this.usersService.save({
        ...googleUser,
        createdBy: 1,
        updatedBy: 1,
      });

      return { id: createdUser.id };
    }
  }

  createJwt(jwtPayload: JwtPayload): string {
    return this.jwtService.sign(jwtPayload, {
      // secret: process.env.JWT_SECRET,
      // expiresIn: '300d',
    });
  }
}
