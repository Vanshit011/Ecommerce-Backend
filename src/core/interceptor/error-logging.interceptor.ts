import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;

    return next.handle().pipe(
      catchError((error) => {
        // Log error with context
        this.logger.error(
          `Error in ${method} ${url}`,
          error.stack || error.message,
        );

        // Log request body for debugging (exclude sensitive fields)
        if (body && Object.keys(body).length > 0) {
          const sanitizedBody = { ...body };
          // Remove sensitive fields from logs
          delete sanitizedBody.password;
          delete sanitizedBody.token;
          this.logger.debug(`Request body: ${JSON.stringify(sanitizedBody)}`);
        }

        // Re-throw the error so NestJS can handle the HTTP response
        return throwError(() => error);
      }),
    );
  }
}
