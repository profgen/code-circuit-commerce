import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class PlatformopsDeprecationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const response = context.switchToHttp().getResponse<{
      setHeader: (name: string, value: string) => void;
    }>();

    response.setHeader('Deprecation', 'true');
    response.setHeader('Sunset', 'Mon, 30 Jun 2026 23:59:59 GMT');
    response.setHeader(
      'Link',
      '</observability>; rel="successor-version", </reliability>; rel="successor-version", </prodops>; rel="successor-version"',
    );
    response.setHeader(
      'X-API-Deprecated-Message',
      'Use /observability, /reliability, and /prodops route groups.',
    );

    return next.handle();
  }
}
