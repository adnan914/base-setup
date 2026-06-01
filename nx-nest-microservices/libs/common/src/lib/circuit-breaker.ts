import CircuitBreaker from 'opossum';
import { firstValueFrom, Observable, timeout } from 'rxjs';

export async function callWithCircuitBreaker<T>(
  command: () => Observable<T>,
  options: CircuitBreaker.Options = {}
): Promise<T> {
  const breaker = new CircuitBreaker(
    () => firstValueFrom(command().pipe(timeout(options.timeout ?? 3000))),
    {
      timeout: 3500,
      errorThresholdPercentage: 50,
      resetTimeout: 10000,
      rollingCountTimeout: 10000,
      ...options
    }
  );
  return breaker.fire() as Promise<T>;
}
