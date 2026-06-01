import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { randomUUID } from 'crypto';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip } = request;
    const requestId = randomUUID();
    const userId = request.user?.sub || 'anonymous';
    const startTime = Date.now();

    // Attach request ID to request for downstream use
    request.requestId = requestId;

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - startTime;
          const response = context.switchToHttp().getResponse();
          this.logger.log(
            `${method} ${url} ${response.statusCode} ${responseTime}ms - user:${userId} ip:${ip} rid:${requestId}`,
          );
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          this.logger.error(
            `${method} ${url} ${error.status || 500} ${responseTime}ms - user:${userId} ip:${ip} rid:${requestId} - ${error.message}`,
          );
        },
      }),
    );
  }
}
