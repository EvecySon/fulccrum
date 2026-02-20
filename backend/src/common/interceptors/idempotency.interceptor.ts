import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { IdempotencyService } from '../services/idempotency.service';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private readonly logger = new Logger(IdempotencyInterceptor.name);

  constructor(private readonly idempotencyService: IdempotencyService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const idempotencyKey = request.headers['idempotency-key'];

    // If no idempotency key provided, proceed normally
    if (!idempotencyKey) {
      return next.handle();
    }

    this.logger.log(`Processing request with idempotency key: ${idempotencyKey}`);

    // Check if this request was already processed
    return from(this.idempotencyService.get(idempotencyKey)).pipe(
      switchMap((cached) => {
        if (cached !== null) {
          this.logger.log(`Returning cached response for key: ${idempotencyKey}`);
          // Return cached response
          return from(Promise.resolve(cached));
        }

        // Process request and cache result
        return next.handle().pipe(
          switchMap(async (response) => {
            // Cache the response
            await this.idempotencyService.set(idempotencyKey, response);
            return response;
          }),
        );
      }),
    );
  }
}
