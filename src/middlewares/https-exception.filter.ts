import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as Sentry from '@sentry/node';

const logger = new Logger();
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const { status, json } = await this.prepareException(exception);
    logger.log(`response: ${JSON.stringify({ status, json })}`);

    response.status(status).send(json);
  }

  async prepareException(
    exc: any,
  ): Promise<{ status: number; json: Record<any, any> }> {
    const error =
      exc instanceof HttpException
        ? exc
        : new InternalServerErrorException(exc.message);

    logger.log(`Send error to SENTRY ${process.env.SENTRY_DNS} ...`);
    if (process.env.SENTRY_DNS) {
      Sentry.captureException(error);
      try {
        const flushResult = await Sentry.flush(2000);

        if (flushResult) {
          logger.log('Sentry flushed successfully!');
        }
      } catch (flushException) {
        logger.error('Flush failed', flushException);
      }
    }

    const status = error.getStatus();
    const response = error.getResponse();
    const json = typeof response === 'string' ? { error: response } : response;
    if (
      process.env.NODE_ENV === 'test' ||
      process.env.NODE_ENV === 'development'
    ) {
      // tslint:disable-next-line: no-console
      // console.log('HttpExceptionFilter');
      // tslint:disable-next-line: no-console
      // console.log('exc', exc);
      // tslint:disable-next-line: no-console
      // console.log('error', error);
    }

    return { status, json };
  }
}
