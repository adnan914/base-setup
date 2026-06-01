import { Logger } from '@nestjs/common';

type LogLevel = 'log' | 'warn' | 'error';

export function createStructuredLogger(service: string, context = service) {
  const logger = new Logger(context);

  return {
    log(payload: Record<string, unknown>) {
      writeStructuredLog(logger, service, 'log', payload);
    },
    warn(payload: Record<string, unknown>) {
      writeStructuredLog(logger, service, 'warn', payload);
    },
    error(payload: Record<string, unknown>) {
      writeStructuredLog(logger, service, 'error', payload);
    },
  };
}

function writeStructuredLog(
  logger: Logger,
  service: string,
  level: LogLevel,
  payload: Record<string, unknown>,
) {
  const message = JSON.stringify({
    service,
    level,
    timestamp: new Date().toISOString(),
    ...payload,
  });

  if (level === 'error') {
    logger.error(message);
    return;
  }

  if (level === 'warn') {
    logger.warn(message);
    return;
  }

  logger.log(message);
}
