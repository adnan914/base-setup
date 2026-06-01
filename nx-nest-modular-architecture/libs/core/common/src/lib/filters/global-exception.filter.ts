import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { RES_MESSAGES } from '../messages';
import { createStructuredLogger } from '../logging/structured-logger';
import { QueryFailedError } from 'typeorm';

type RequestWithId = Request & { requestId?: string };

type DbConstraintMapping = Record<string, string>;
type DatabaseErrorShape = {
  driverError?: {
    code?: string;
    constraint?: string;
    message?: string;
  };
  code?: string;
  constraint?: string;
  message?: string;
};

const DB_UNIQUE_CONSTRAINT_MESSAGES: DbConstraintMapping = {
  uq_users_email_lower: RES_MESSAGES.EMAIL_ALREADY_EXISTS,
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  private readonly structuredLogger = createStructuredLogger(
    'application',
    GlobalExceptionFilter.name,
  );

  private getUniqueConstraintMessage(exception: unknown): string | null {
    const ex = exception as DatabaseErrorShape;
    const driverError = ex?.driverError ?? ex;
    const driverMessage = String(driverError?.message ?? ex?.message ?? '');
    const rawConstraint =
      (typeof driverError?.constraint === 'string' && driverError.constraint) ||
      this.extractConstraintNameFromMessage(driverMessage);
    const constraint = rawConstraint ? rawConstraint.split('.').pop() ?? rawConstraint : null;

    if (constraint && DB_UNIQUE_CONSTRAINT_MESSAGES[constraint]) {
      return DB_UNIQUE_CONSTRAINT_MESSAGES[constraint];
    }

    const code = String(driverError?.code ?? '');
    const looksLikeDuplicate =
      code === '23505' ||
      /duplicate key value violates unique constraint/i.test(driverMessage) ||
      /unique constraint/i.test(driverMessage);

    return looksLikeDuplicate ? RES_MESSAGES.DUPLICATE_ENTRY : null;
  }

  private extractConstraintNameFromMessage(message: string): string | null {
    const patterns: RegExp[] = [
      /unique constraint \"([^\"]+)\"/i,
      /unique constraint ([A-Za-z0-9_.]+)/i,
      /constraint \"([^\"]+)\"/i,
      /constraint ([A-Za-z0-9_.]+)/i,
    ];
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match?.[1]) return match[1];
    }
    return null;
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithId>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string = RES_MESSAGES.INTERNAL_SERVER_ERROR;
    let error: string = 'Internal Server Error';
    let errors: unknown = null;

    // Translate DB unique constraint violations into RES_MESSAGES.
    const dbError = exception as DatabaseErrorShape;
    if (exception instanceof QueryFailedError || dbError?.driverError?.code === '23505') {
      const uniqueMessage = this.getUniqueConstraintMessage(exception);
      if (uniqueMessage) {
        status = HttpStatus.CONFLICT;
        message = uniqueMessage;
        error = 'Conflict';
      }
    }

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const ex = exceptionResponse as {
          message?: string | string[];
          error?: string;
          errors?: unknown;
        };
        const rawMessage = ex.message;
        // Keep a friendly top-level message, but preserve field-level errors.
        if (Array.isArray(rawMessage)) {
          // This is how ValidationPipe often returns errors.
          errors = errors ?? rawMessage;
          message = RES_MESSAGES.VALIDATION_ERROR;
        } else {
          message = rawMessage || exception.message;
        }
        error = ex.error || exception.message;

        // 👇 class-validator detailed errors
        if (ex.errors) errors = ex.errors;
      } else {
        message = exception.message;
        error = exception.message;
      }

      // If an HttpException contains a DB unique constraint string, translate it.
      const constraintFromMessageRaw = this.extractConstraintNameFromMessage(String(message));
      const constraintFromMessage = constraintFromMessageRaw
        ? constraintFromMessageRaw.split('.').pop() ?? constraintFromMessageRaw
        : null;
      if (constraintFromMessage && DB_UNIQUE_CONSTRAINT_MESSAGES[constraintFromMessage]) {
        status = HttpStatus.CONFLICT;
        message = DB_UNIQUE_CONSTRAINT_MESSAGES[constraintFromMessage];
        error = 'Conflict';
      } else if (status === HttpStatus.BAD_REQUEST && String(message).toLowerCase() === 'validation failed') {
        // Fallback for older/custom validation errors.
        message = RES_MESSAGES.VALIDATION_ERROR;
      }
    } else if (exception instanceof Error) {
      // Prefer translated unique constraint messages if available.
      const uniqueMessage = this.getUniqueConstraintMessage(exception);
      if (uniqueMessage) {
        status = HttpStatus.CONFLICT;
        message = uniqueMessage;
        error = 'Conflict';
      } else {
        // Do not leak raw internal errors to clients.
        message = RES_MESSAGES.INTERNAL_SERVER_ERROR;
        error = 'Internal Server Error';
      }
    }

    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );
    this.structuredLogger.error({
      event: 'unhandled_exception',
      requestId: request.requestId,
      method: request.method,
      path: request.url,
      statusCode: status,
      message,
      error,
    });

    response.status(status).json({
      success: false,
      message,
      error,
      errors, // <-- includes detailed validation errors
      requestId: request.requestId,
      statusCode: status,
    });
  }
}
