import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import {
  ALLOW_PUBLIC_ENDPOINT_METADATA,
  PUBLIC_ENDPOINT_METADATA,
} from 'src/config';
import { ERole } from 'src/users/users.enum';

export const RequireRoles = (roles: ERole[]) => SetMetadata('roles', roles);

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    return request.user;
  },
);

export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    return request.user.id;
  },
);

export const IsPublic = () => SetMetadata(PUBLIC_ENDPOINT_METADATA, true);

export const IsAllowPublic = () =>
  SetMetadata(ALLOW_PUBLIC_ENDPOINT_METADATA, true);
