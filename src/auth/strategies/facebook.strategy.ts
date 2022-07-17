import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { FacebookUser } from 'src/users/users.type';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super({
      clientID: process.env.FB_APP_ID,
      clientSecret: process.env.FB_APP_SECRET,
      callbackURL: `${process.env.API_URL}/auth/facebook/redirect`,
      scope: 'email',
      profileFields: ['emails', 'name', 'displayName', 'gender', 'photos'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    const { id, displayName } = profile;

    const user: FacebookUser = {
      facebookId: id,
      facebookAccessToken: accessToken,
    };

    const email =
      profile.emails && profile.emails.length > 0
        ? profile.emails[0].value
        : '';

    if (email) {
      user.facebookEmail = email;
    }

    if (displayName) {
      user.facebookFullname = displayName;
    } else {
      const fullname = `${
        profile.name?.givenName ? profile.name?.givenName + ' ' : ''
      }${profile.name?.familyName ? profile.name?.familyName : ''}`;

      if (fullname) {
        user.facebookFullname = fullname;
      }
    }

    const avatarURL =
      profile.photos && profile.photos.length > 0
        ? profile.photos[0].value
        : '';

    if (avatarURL) {
      user.facebookAvatarURL = avatarURL;
    }

    done(null, user);
  }
}
