import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';

@Injectable()
export class UsersUtil {
  parse(user: User): User {
    const {
      fullname,
      email,
      avatarURL,
      facebookFullname,
      facebookEmail,
      facebookAvatarURL,
      googleFullname,
      googleEmail,
      googleAvatarURL,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      password,
      ...extraUser
    } = user;

    return {
      ...extraUser,
      fullname,
      email,
      avatarURL,
      displayName: fullname || facebookFullname || googleFullname,
      displayEmail: email || facebookEmail || googleEmail,
      displayAvatarURL: avatarURL || facebookAvatarURL || googleAvatarURL,
    };
  }

  parseAll(users: User[]): User[] {
    return users.map((user) => this.parse(user));
  }
}
