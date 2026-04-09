import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditService } from './audit.service';

type RequestWithMeta = {
  method?: string;
  originalUrl?: string;
  user?: {
    userId?: string;
    role?: string;
  };
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<RequestWithMeta>();
    const method = req.method ?? 'GET';
    const shouldAudit = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method);

    if (!shouldAudit) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const actorUserId = req.user?.userId;
          if (!actorUserId) {
            return;
          }
          void this.auditService.log(
            actorUserId,
            `${method} ${req.originalUrl ?? ''}`,
            'HTTP_ENDPOINT',
            req.originalUrl ?? '',
            JSON.stringify({
              role: req.user?.role ?? 'unknown',
            }),
          );
        },
      }),
    );
  }
}
