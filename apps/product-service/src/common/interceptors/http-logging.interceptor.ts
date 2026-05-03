import { CallHandler, ExecutionContext, HttpException, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, catchError, tap, throwError } from 'rxjs';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<{ method: string; url: string }>();
    const res = context.switchToHttp().getResponse<{ statusCode: number }>();
    const { method, url } = req;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        this.logger.log(`${method} ${url} ${res.statusCode} ${Date.now() - start}ms`);
      }),
      catchError((err: unknown) => {
        const status = err instanceof HttpException ? err.getStatus() : 500;
        const message = `${method} ${url} ${status} ${Date.now() - start}ms`;
        if (status >= 500) {
          this.logger.error(message);
        } else {
          this.logger.log(message);
        }
        return throwError(() => err);
      }),
    );
  }
}
