import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { config } from 'dotenv';

import { Injectable } from '@nestjs/common';
import { GoogleUser } from 'src/users/users.type';

config();

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: `${process.env.API_URL}/auth/google/redirect`,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;

    const user: GoogleUser = {
      googleEmail: emails[0].value,
      googleFullname:
        `${name?.givenName ? name.givenName + ' ' : ''}${
          name?.familyName || ''
        }`.trim() || undefined,
      googleAvatarURL:
        photos && photos.length > 0 ? photos[0].value : undefined,
      googleAccessToken: accessToken,
    };

    done(null, user);
  }
}
