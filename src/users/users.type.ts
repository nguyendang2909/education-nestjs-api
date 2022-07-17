import { User } from './entities/user.entity';

export type UserWithoutPassword = Omit<User, 'password'>;

export type FacebookUser = {
  facebookAccessToken: string;
  facebookId: string;
  facebookFullname?: string;
  facebookAvatarURL?: string;
  facebookEmail?: string;
};

export type GoogleUser = {
  googleAccessToken: string;
  googleEmail?: string;
  googleFullname?: string;
  googleAvatarURL?: string;
};
