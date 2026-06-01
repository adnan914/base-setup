// import {
//   Injectable,
//   NestInterceptor,
//   ExecutionContext,
//   CallHandler,
// } from '@nestjs/common';
// import { Observable } from 'rxjs';
// import { map } from 'rxjs/operators';

// export interface Response<T> {
//   success: boolean;
//   data: T;
//   message: string;
//   timestamp: string;
// }

// @Injectable()
// export class ResponseInterceptor<T>
//   implements NestInterceptor<T, Response<T>>
// {
//   intercept(
//     context: ExecutionContext,
//     next: CallHandler,
//   ): Observable<Response<T>> {
//     return next.handle().pipe(
//       map((data) => ({
//         success: true,
//         data,
//         message: 'Operation completed successfully',
//         timestamp: new Date().toISOString(),
//       })),
//     );
//   }
// }

// response.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MESSAGES } from '@lib/core/common';
import { RES_MESSAGES } from '../messages';

export interface Response<T> {
  success: boolean;
  data: T;
  message: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest<{ method?: string }>();
    const customMessage = this.reflector.get<string>(
      MESSAGES,
      context.getHandler(),
    );

    return next.handle().pipe(
      map((data) => {
        const message = this.resolveMessage(
          request?.method?.toUpperCase() ?? 'GET',
          data,
          customMessage,
        );

        return {
          success: true,
          data,
          message,
        };
      }),
    );
  }

  private resolveMessage(method: string, data: T, customMessage?: string) {
    if (method === 'GET' && this.isDataEmpty(data)) {
      return RES_MESSAGES.DATA_NOT_AVAILABLE;
    }

    if (customMessage) {
      return customMessage;
    }

    return 'Operation completed successfully';
    // switch (method) {
    //   case "POST":
    //     return RES_MESSAGES.CREATED;
    //   case "PATCH":
    //   case "PUT":
    //     return RES_MESSAGES.UPDATED;
    //   case "DELETE":
    //     return RES_MESSAGES.DELETED;
    //   case "GET":
    //   default:
    //     return RES_MESSAGES.DATA_FOUND;
    // }
  }

  private isDataEmpty(data: T) {
    if (data == null) {
      return true;
    }

    if (Array.isArray(data)) {
      return data.length === 0;
    }

    if (typeof data !== 'object') {
      return false;
    }

    const record = data as Record<string, unknown>;

    if (Array.isArray(record['items'])) {
      return (record['items'] as unknown[]).length === 0;
    }

    const values = Object.values(record);
    return values.length === 0;
  }
}
