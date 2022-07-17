import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import {
  ALLOW_PUBLIC_ENDPOINT_METADATA,
  PUBLIC_ENDPOINT_METADATA,
} from 'src/config';

@Injectable()
export class JwtAuthGuard extends AuthGuard(['jwt']) {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      PUBLIC_ENDPOINT_METADATA,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true;
    }

    // Add your custom authentication logic here
    // for example, call super.logIn(request) to establish a session.
    return super.canActivate(context);
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

    const isAllowPublic = this.reflector.getAllAndOverride<boolean>(
      ALLOW_PUBLIC_ENDPOINT_METADATA,
      [context.getHandler(), context.getClass()],
    );

    if (user) {
      if (req.method === 'POST') {
        req.body.createdBy = user.id;

        req.body.updatedBy = user.id;
      } else if (['PATCH', 'PUT'].includes(req.method)) {
        req.body.updatedBy = user.id;
      }
      return user;
    }

    if (isAllowPublic) {
      return true;
    }

    throw err || new UnauthorizedException();
  }
}
