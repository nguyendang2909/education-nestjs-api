import { Request as ExpressRequest } from 'express';
import {
  FacebookUser,
  GoogleUser,
  UserWithoutPassword,
} from 'src/users/users.type';

export type JwtPayload = {
  id: number;
  facebookId?: string;
};

export type ForgotPasswordJwt = {
  id: number;
};

export type PrivateRequest = ExpressRequest & {
  user: UserWithoutPassword;
};

export type PublicRequest = ExpressRequest & {
  user?: UserWithoutPassword;
};

export type FacebookRedirectRequest = ExpressRequest & {
  user: FacebookUser;
};

export type GoogleRedirectRequest = ExpressRequest & {
  user: GoogleUser;
};

export type BooleanString = 'true' | 'false';
