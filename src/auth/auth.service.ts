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
      throw new BadRequestException('Không tìm thấy secret key');
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
      subject: `Lấy lại mật khẩu mới trên ${messagesService.setText(
        Messages.app.shortTitleDomain,
      )}`,
      html: `
              <p>Chào ${user.fullname}</p>

              <p>Bạn hoặc ai đó vừa yêu cầu lấy lại mật khẩu mới trên ${messagesService.setText(
                Messages.app.shortTitleDomain,
              )}

              <p>Để tạo mật khẩu mới, bạn hãy bấm vào link dưới đây:</p>

              <p>${appDomain}/change-forgot-password?auth=${jwt}
              </p>

              <p>Nếu không muốn đổi mật khẩu, bạn hãy bỏ qua email này.
              <br />
              Link này có giá trị trong 15 phút.
              </p>

              <p>Nếu có vướng mắc gì thêm, bạn vui lòng liên hệ theo thông tin phía dưới:
              <br />- Hotline: ${Messages.app.hotline}
              <br />- Hoặc truy cập ${appDomain} và chat với tư vấn viên
              </p>

              <p>
              Cảm ơn bạn đã sử dụng dịch vụ của Leslei.
              </p>

              <p>Trân trọng.</p>

              <p>_______________________________________</p>

              <p><b>${Messages.app.shortTitle} - Học từ Chuyên gia</b></p>

              <p><b>${
                Messages.app.shortTitle
              }</b> là một hệ thống đào tạo trực tuyến, cổng kết nối Chuyên gia với Học viên

              <br />Sứ mệnh: chia sẻ kiến thức, kinh nghiệm thực tế cho 10 triệu người dân Việt Nam</br>
              <br />Địa chỉ: ${Messages.app.location} </p>
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
      throw new BadRequestException('Không tìm thấy secret key');
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
