import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ACCESS_TOKEN_COOKIE } from 'src/config';
import { UsersService } from 'src/users/users.service';
import { AuthJwtPayload } from '../auth.type';
import { UserWithoutPassword } from 'src/users/users.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: (req) => {
        if (req && req.cookies) {
          return req.cookies[ACCESS_TOKEN_COOKIE];
        }

        return null;
      },
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(jwtPayload: AuthJwtPayload): Promise<UserWithoutPassword> {
    const user = await this.usersService.findCurrent(jwtPayload.id);

    delete user.password;

    return user;
  }
}
