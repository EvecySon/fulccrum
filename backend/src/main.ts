import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import helmet from 'helmet';
import compression from 'compression';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Security: Helmet adds various HTTP headers for security
  if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
  } else {
    app.use(helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: false,
      crossOriginOpenerPolicy: false,
    }));
  }

  // Performance: Compress responses for mobile optimization
  app.use(compression());

  // Serve static files from uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
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

  const prisma = app.get(PrismaService);
  await prisma.enableShutdownHooks(app);

  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📱 Mobile access: http://192.168.18.3:${port}`);
}
bootstrap();
