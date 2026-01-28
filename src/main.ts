import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';

import { AppModule } from './app.module';
import { config } from './config';

const isProd = config.app.isProd;
const port = Number(config.port ?? 3001);
const swaggerUrl = isProd ? 'docs/on-cre' : 'doc';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.use(json({ limit: '100mb' }));
  app.use(urlencoded({ limit: '100mb' }));

  app.useGlobalPipes(new ValidationPipe({}));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('On Cre API Documentation')
    .setDescription('On Cre V1 API Documentation')
    .setVersion('2.0')
    .addTag('On-Cre')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(swaggerUrl, app, document);

  await app.listen(port, () => {
    console.log(`Server listening on ${config.port}`);
  });
}

void bootstrap();
