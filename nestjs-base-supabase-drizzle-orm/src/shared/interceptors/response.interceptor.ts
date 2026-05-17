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
import { MESSAGES } from '@/shared/decorators/messages.decorator';

export interface Response<T> {
  success: boolean;
  data: T;
  message: string;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, Response<T>> {
  constructor(private reflector: Reflector) { }

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const message =
      this.reflector.get<string>(MESSAGES, context.getHandler())

    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        message
      })),
    );
  }
}
