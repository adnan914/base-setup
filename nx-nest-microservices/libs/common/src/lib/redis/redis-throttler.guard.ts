import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HEALTH_PATH, METRICS_PATH } from '@ecommerce/contracts';
import Redis from 'ioredis';

@Injectable()
export class RedisThrottlerGuard implements CanActivate {
  private static readonly script = `
local current = redis.call("INCR", KEYS[1])
if current == 1 then
  redis.call("EXPIRE", KEYS[1], ARGV[1])
end
return current
`;
  private readonly redis: Redis;

  constructor(private readonly config: ConfigService) {
    this.redis = new Redis({
      host: this.config.get<string>('redis.host') ?? 'redis',
      port: this.config.get<number>('redis.port') ?? 6379
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if ([HEALTH_PATH, METRICS_PATH].includes(request.path)) return true;
    const key = `rate-limit:${request.ip ?? request.headers['x-forwarded-for'] ?? 'unknown'}`;
    const ttl = this.config.get<number>('security.rateLimitTtl') ?? 60;
    const limit = this.config.get<number>('security.rateLimitLimit') ?? 100;
    const count = Number(await this.redis.eval(RedisThrottlerGuard.script, 1, key, ttl));
    if (count > limit) throw new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
    return true;
  }
}
