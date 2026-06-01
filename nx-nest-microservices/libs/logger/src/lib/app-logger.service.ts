import { ConsoleLogger, Injectable, LogLevel } from '@nestjs/common';
import { getRequestId } from '@ecommerce/common';

@Injectable()
export class AppLogger extends ConsoleLogger {
  constructor() {
    const levels: LogLevel[] =
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn', 'log']
        : ['error', 'warn', 'log', 'debug', 'verbose'];
    super('Ecommerce', { timestamp: true, logLevels: levels, json: process.env.NODE_ENV === 'production' });
  }

  protected override formatPid(_pid: number): string {
    const requestId = getRequestId();
    return requestId ? `[${requestId}] ` : '';
  }
}
