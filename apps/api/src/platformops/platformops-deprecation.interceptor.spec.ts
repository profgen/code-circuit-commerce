import { of } from 'rxjs';
import { PlatformopsDeprecationInterceptor } from './platformops-deprecation.interceptor';

describe('PlatformopsDeprecationInterceptor', () => {
  it('adds deprecation and migration headers for legacy routes', (done) => {
    const interceptor = new PlatformopsDeprecationInterceptor();
    const setHeader = jest.fn();

    const context = {
      switchToHttp: () => ({
        getResponse: () => ({ setHeader }),
      }),
    } as never;

    const callHandler = {
      handle: () => of('ok'),
    };

    interceptor.intercept(context, callHandler).subscribe({
      next: () => {
        expect(setHeader).toHaveBeenCalledWith('Deprecation', 'true');
        expect(setHeader).toHaveBeenCalledWith(
          'Sunset',
          'Mon, 30 Jun 2026 23:59:59 GMT',
        );
        expect(setHeader).toHaveBeenCalledWith(
          'X-API-Deprecated-Message',
          'Use /observability, /reliability, and /prodops route groups.',
        );
      },
      complete: done,
    });
  });
});
