import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import helmet from 'helmet';
import compression from 'compression';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Security: Helmet adds various HTTP headers for security
  // Always enabled - relaxed CSP in development for debugging tools
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? true : false,
    crossOriginResourcePolicy: process.env.NODE_ENV === 'production' ? true : false,
    crossOriginOpenerPolicy: process.env.NODE_ENV === 'production' ? true : false,
  }));

  // Performance: Compress responses for mobile optimization
  app.use(compression());

  // Serve static files from uploads directory
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? [process.env.FRONTEND_URL || 'https://fulccrum.com']
      : '*',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global request logging interceptor
  const { LoggingInterceptor } = await import('./common/interceptors/logging.interceptor');
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger API documentation (disabled in production for security)
  if (process.env.NODE_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Fulccrum API')
      .setDescription('Fulccrum Super-App Backend API — Food delivery, Package delivery, E-commerce, Services')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication & registration')
      .addTag('orders', 'Order management')
      .addTag('payment', 'Payments & wallet')
      .addTag('chat', 'Live chat system')
      .addTag('courier', 'Courier operations')
      .addTag('admin', 'Admin panel')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  const prisma = app.get(PrismaService);
  await prisma.enableShutdownHooks(app);

  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server running on http://localhost:${port}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📱 Mobile access: http://192.168.18.7:${port}`);
    console.log(`📖 API Docs: http://localhost:${port}/api/docs`);
  }
}
bootstrap();
