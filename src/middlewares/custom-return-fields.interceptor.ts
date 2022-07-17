import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import * as lodash from 'lodash';

function processObj(
  data: any,
  objectFields: string[],
  propFields: string[],
  options: any,
) {
  const keepPath =
    options && lodash.has(options, 'keepPath') ? options.keepPath : true;

  const exclude =
    options && lodash.has(options, 'exclude') ? options.exclude : false;

  let item = {};

  if (propFields.length > 0 || exclude) {
    item = !exclude
      ? lodash.pick(data, propFields)
      : lodash.omit(data, propFields);
  }

  if (objectFields.length > 0) {
    const mapOb: any = {};

    lodash.forEach(objectFields, (f) => {
      const token = f.replace(new RegExp(/\[\]/gm), '').split('.');

      const obj: any = lodash.head(token);

      const prop = lodash.tail(token).join('.');

      if (mapOb[obj]) {
        mapOb[obj].push(prop);
      } else {
        mapOb[obj] = [prop];
      }
    });

    lodash.forEach(mapOb, (prop, obj) => {
      if (lodash.isArray(data[obj]) || lodash.isObject(data[obj])) {
        const returned = deepPick(data[obj], prop, options);

        if (keepPath || !lodash.isEmpty(returned)) {
          item[obj] = returned;
        } else if (exclude) {
          delete item[obj];
        }
      } else {
        item[obj] = data[obj];
      }
    });
  }

  return item;
}

function deepPick(
  data: Record<string, any>[] | Record<string, any> | any,
  inputFields: string | string[],
  options: { keepPath?: boolean; exclude?: boolean } = {},
) {
  const keepPath =
    options && lodash.has(options, 'keepPath') ? options.keepPath : true;

  const fields = lodash.isArray(inputFields) ? inputFields : [inputFields];

  const objectFields = lodash.filter(fields, (n) => n.indexOf('.') !== -1);

  const propFields = lodash.difference(fields, objectFields);

  let result: any;

  if (lodash.isArray(data)) {
    result = [];

    lodash.forEach(data, (d) => {
      const returned = processObj(d, objectFields, propFields, options);

      if (keepPath || !lodash.isEmpty(returned)) {
        result.push(returned);
      }
    });
  } else if (lodash.isObject(data)) {
    result = processObj(data, objectFields, propFields, options);
  } else {
    result = data;
  }

  return result;
}

export interface Response<T> {
  data: T;
}

@Injectable()
export class CustomReturnFieldsInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const req = context.switchToHttp().getRequest();

    const requestLogger = {
      body: req.body,
      params: req.params,
      query: req.query,
      url: req.originalUrl,
    };

    const logger = new Logger();

    logger.log(`request: ${JSON.stringify(requestLogger)}`);

    const now = Date.now();

    const fields = lodash.get(req, 'query.fields', '');

    const fieldsArray = fields.split(',');

    return next.handle().pipe(
      map((data) => {
        logger.log(`Consumming Time... ${Date.now() - now}ms`);

        if (fields && fieldsArray.length > 0) {
          const responseData = lodash.get(data, 'data');

          const pickData = deepPick(responseData, fieldsArray);

          lodash.set(data, 'data', pickData);

          logger.log(`Total Time... ${Date.now() - now}ms`);

          logger.log(`response: ${JSON.stringify(data)}`);

          return data;
        }

        logger.log(
          `response: ${data?.type && JSON.stringify({ type: data.type })}`,
        );

        return data;
      }),
    );
  }
}
