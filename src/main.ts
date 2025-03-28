import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe());
  
  const config = new DocumentBuilder()
    .setTitle('Blockchain Indexing Platform')
    .setDescription('API documentation for the Blockchain Indexing Platform')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('database', 'Database connection management')
    .addTag('indexer', 'Blockchain indexing operations')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await app.listen(3000);
}

bootstrap();