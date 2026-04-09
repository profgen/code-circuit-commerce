import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';
import { AuditInterceptor } from './audit/audit.interceptor';
import { AuditService } from './audit/audit.service';
import { assertRequiredEnv } from './config/env.validation';
import { PlatformopsService } from './platformops/platformops.service';
import { randomUUID } from 'crypto';

async function bootstrap() {
  assertRequiredEnv();
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  });
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new AuditInterceptor(app.get(AuditService)));
  const platformopsService = app.get(PlatformopsService);
  app.use((req: Request, res: Response, next: NextFunction) => {
    const startedAt = Date.now();
    const traceId = req.header('x-trace-id') ?? randomUUID();

    res.setHeader('x-trace-id', traceId);
    res.on('finish', () => {
      void platformopsService.logTrace(
        traceId,
        req.originalUrl ?? '/',
        req.method ?? 'GET',
        Date.now() - startedAt,
        res.statusCode ?? 200,
      );
    });
    next();
  });
  await app.listen(process.env.PORT ?? 4000);
}
void bootstrap();
