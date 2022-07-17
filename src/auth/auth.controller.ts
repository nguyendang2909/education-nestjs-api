import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import moment from 'moment';
import { ACCESS_TOKEN_COOKIE } from 'src/config';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { IsPublic } from 'src/commons/decorators';
import { AuthGuard } from '@nestjs/passport';
import {
  FacebookRedirectRequest,
  GoogleRedirectRequest,
  PrivateRequest,
} from 'src/commons/types';
import { Messages, messagesService } from 'src/commons/messages';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ChangeForgotPasswordDto } from './dto/change-forgot-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  @IsPublic()
  @UseGuards(AuthGuard('local'))
  async login(
    @Req() req: PrivateRequest,
    @Body() loginDto: LoginDto,
    @Res() res: Response,
  ) {
    const { user } = req;

    const jwt = this.authService.createJwt({ id: user.id });

    res
      .cookie(ACCESS_TOKEN_COOKIE, jwt, {
        expires: moment().add(300, 'days').toDate(),
        sameSite: 'strict',
        httpOnly: true,
      })
      .send({ type: 'user', message: 'Đăng nhập thành công' });

    return { type: 'user', message: 'Đăng nhập thành công' };
  }

  @Post('forgot-password')
  @IsPublic()
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return {
      type: 'forgotPassword',
      data: await this.authService.forgotPassword(forgotPasswordDto),
    };
  }

  @Post('change-forgot-password')
  @IsPublic()
  async changeForgotPassword(
    @Body() changeForgotPassword: ChangeForgotPasswordDto,
    @Res() res: Response,
  ) {
    const user = await this.authService.changeForgotPassword(
      changeForgotPassword,
    );

    const jwt = this.authService.createJwt({ id: user.id });

    res
      .cookie(ACCESS_TOKEN_COOKIE, jwt, {
        expires: moment().add(300, 'days').toDate(),
        sameSite: 'strict',
        httpOnly: true,
      })
      .send({ type: 'user', message: 'Đăng nhập thành công' });

    return {
      type: 'user',
      message: 'Đăng nhập thành công.',
    };
  }

  @Get('facebook')
  @IsPublic()
  @UseGuards(AuthGuard('facebook'))
  async facebookLogin(@Body() body) {
    return HttpStatus.OK;
  }

  @Get('facebook/redirect')
  @IsPublic()
  @UseGuards(AuthGuard('facebook'))
  async facebookLoginRedirect(
    @Req() req: FacebookRedirectRequest,
    @Res() res: Response,
  ) {
    const facebookUser = req.user;

    const user = await this.authService.getUserFromFacebook(facebookUser);

    const jwt = this.authService.createJwt({ id: user.id });

    res
      .cookie(ACCESS_TOKEN_COOKIE, jwt, {
        expires: moment().add(300, 'days').toDate(),
        sameSite: 'strict',
        httpOnly: true,
      })
      .redirect(`${process.env.UI_URL}`);
  }

  @Get('facebook/logout')
  @IsPublic()
  async facebookLogout(@Body() body) {
    return HttpStatus.OK;
  }

  @Get('google')
  @IsPublic()
  @UseGuards(AuthGuard('google'))
  async googleLogin(@Body() body) {
    return HttpStatus.OK;
  }

  @Get('google/redirect')
  @IsPublic()
  @UseGuards(AuthGuard('google'))
  async googleLoginRedirect(
    @Req() req: GoogleRedirectRequest,
    @Res() res: Response,
  ) {
    const googleUser = req.user;

    const user = await this.authService.getUserFromGoogle(googleUser);

    const jwt = this.authService.createJwt({ id: user.id });

    res
      .cookie(ACCESS_TOKEN_COOKIE, jwt, {
        expires: moment().add(300, 'days').toDate(),
        sameSite: 'strict',
        httpOnly: true,
      })
      .redirect(`${process.env.UI_URL}`);
  }

  @Get('/logout')
  @IsPublic()
  async logout(@Res() res: Response) {
    res.clearCookie(ACCESS_TOKEN_COOKIE);

    res.send({ message: messagesService.setText(Messages.auth.logoutSuccess) });
  }

  @Post('register')
  @IsPublic()
  async register(@Body() registerDto: CreateUserDto, @Res() res: Response) {
    const createdUser = await this.authService.register(registerDto);

    const token = this.authService.createJwt({
      id: createdUser.id,
    });

    res
      .cookie(ACCESS_TOKEN_COOKIE, token, {
        expires: moment().add(300, 'days').toDate(),
        sameSite: 'strict',
        httpOnly: true,
      })
      .send({ type: 'registerUser', data: createdUser });
  }
}
