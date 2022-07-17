// import {
//   Injectable,
//   NestMiddleware,
//   UnauthorizedException,
// } from '@nestjs/common';
// import * as jwt from 'jsonwebtoken';
// import { Reflector } from '@nestjs/core';
// import { NextFunction } from 'express';
// import { UsersService } from 'src/users/users.service';
// import { JwtPayload, PrivateRequest } from 'src/commons/types';
// import { Message, textUtils } from 'src/commons/text';
// import { ACCESS_TOKEN_COOKIE } from 'src/config';

// @Injectable()
// export class AuthMiddleware implements NestMiddleware {
//   constructor(
//     private readonly usersService: UsersService,
//     private readonly reflector: Reflector,
//   ) {}

//   async use(req: PrivateRequest, res: Response, next: NextFunction) {
//     const token = req.cookies?.[ACCESS_TOKEN_COOKIE];

//     if (!token) {
//       throw new UnauthorizedException(
//         textUtils.setText(Message.auth.loginRequire),
//       );
//     }

//     try {
//       const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string, {
//         ignoreExpiration: false,
//       }) as JwtPayload;

//       // eslint-disable-next-line @typescript-eslint/no-unused-vars
//       const { password, ...userWithoutPassowrd } =
//         await this.usersService.findOneOrFailById(decodedToken.id, {});

//       req.user = userWithoutPassowrd;

//       if (req.method === 'POST') {
//         req.body.createdBy = userWithoutPassowrd.id;

//         req.body.updatedBy = userWithoutPassowrd.id;
//       } else if (['PATCH', 'PUT'].includes(req.method)) {
//         req.body.updatedBy = userWithoutPassowrd.id;
//       }
//     } catch (err) {
//       throw new UnauthorizedException(
//         textUtils.setText(Message.auth.loginRequire),
//       );
//     }

//     next();
//   }
// }
