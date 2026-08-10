import { BadRequestException, ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import type { CorsConfig, NestConfig, SwaggerConfig } from 'src/common/configs/config.interface';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
// import { SocketIoAdapter } from './websocket-adapter';
// import * as multer from 'multer';
// import * as express from 'express';
// import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // const multerConfig: multer.Options = {
  //   storage: multer.diskStorage({
  //     destination: './upload', // or another appropriate destination
  //     filename: (req, file, cb) => {
  //       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  //       cb(null, file.fieldname + '-' + uniqueSuffix);
  //     },
  //   }),
  // };
  // app.use(multer(multerConfig).any());
  // app.use(bodyParser.json());
  // app.use(bodyParser.urlencoded({ extended: true }
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // app.useWebSocketAdapter(new SocketIoAdapter(app));

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const messages = errors.map(
          (err) => `${err.property} - ${Object.values(err.constraints).join(', ')}`
        );

        // Log it here
        console.warn('Validation error:', messages);

        return new BadRequestException(messages);
      },
    })
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.enableShutdownHooks();
  app.use((req, res, next) => {
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress;

    console.info('Incoming Request:', {
      method: req.method,
      path: req.path,
      originalUrl: req.originalUrl,
      ip: clientIp,
      body: req.body,
      params: req.params,
      query: req.query,
    });

    next();
  });

  const configService = app.get(ConfigService);
  const nestConfig = configService.get<NestConfig>('nest');
  const corsConfig = configService.get<CorsConfig>('cors');
  const swaggerConfig = configService.get<SwaggerConfig>('swagger');

  // Swagger Api
  if (swaggerConfig.enabled) {
    const options = new DocumentBuilder()
      .setTitle(swaggerConfig.title || 'QR Checker')
      .setDescription(swaggerConfig.description || 'QR Checker Apps')
      .setVersion(swaggerConfig.version || '1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, options);

    SwaggerModule.setup(swaggerConfig.path || 'docs', app, document, {
      explorer: true,
      customSiteTitle: 'POST IT',
    });
  }

  // Cors
  if (corsConfig.enabled) {
    app.enableCors();
  }

  await app.listen(process.env.PORT || nestConfig.port || 8080);

  console.log(`Application is running on: ${await app.getUrl()}/${swaggerConfig.path}`);
}
bootstrap();
