import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { CustomReturnFieldsInterceptor } from './middlewares/custom-return-fields.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { HttpExceptionFilter } from './middlewares/https-exception.filter';
import fs from 'fs';

const logger = new Logger();

async function bootstrap() {
  const app =
    process.env.NODE_ENV === 'development'
      ? await NestFactory.create(AppModule, {
          httpsOptions: {
            key: fs.readFileSync('./localhost-key.pem'),
            cert: fs.readFileSync('./localhost.pem'),
          },
        })
      : await NestFactory.create(AppModule);

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalInterceptors(new CustomReturnFieldsInterceptor());

  app.use(helmet());

  app.use((req, res, next) => {
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  });

  process.env.NODE_ENV === 'development' && createSwagger(app);

  await app.listen(process.env.API_PORT as string);

  logger.log(`Application running on port ${process.env.API_PORT}`);
}

function createSwagger(app: INestApplication) {
  const options = new DocumentBuilder()
    .setTitle('Education')
    .setDescription('Hệ thống giáo dục trực tuyến')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('swagger', app, document);
}

bootstrap();
