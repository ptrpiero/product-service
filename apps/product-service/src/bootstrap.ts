import { NestFactory, AbstractHttpAdapter } from '@nestjs/core';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpLoggingInterceptor } from './common/interceptors/http-logging.interceptor';

export async function createApp(
  adapter?: AbstractHttpAdapter,
): Promise<INestApplication> {
  const app = adapter
    ? await NestFactory.create(AppModule, adapter)
    : await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalInterceptors(new HttpLoggingInterceptor());

  if (process.env.SWAGGER_ENABLED === 'true') {
    const config = new DocumentBuilder()
      .setTitle('Product Service')
      .setDescription('E-commerce products REST API')
      .setVersion('1.0')
      .addBearerAuth()
      .addServer(process.env.API_URL ?? 'http://localhost:3000')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    document.security = [{ bearer: [] }];
    SwaggerModule.setup('api-doc', app, document, {
      customJs: [
        'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js',
        'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js',
      ],
      customCssUrl:
        'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css',
    });
  }

  return app;
}
