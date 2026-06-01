import { ArgumentsHost, Catch, RpcExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { throwError } from 'rxjs';

@Catch()
export class GlobalGrpcExceptionFilter implements RpcExceptionFilter<unknown> {
  catch(exception: unknown, _host: ArgumentsHost) {
    if (exception instanceof RpcException) {
      return throwError(() => exception.getError());
    }
    return throwError(() => new RpcException(exception instanceof Error ? exception.message : 'Internal service error'));
  }
}
