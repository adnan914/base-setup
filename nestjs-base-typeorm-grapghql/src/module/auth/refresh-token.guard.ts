import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization']?.split(' ')[1];
    return !!token;
  }
}
