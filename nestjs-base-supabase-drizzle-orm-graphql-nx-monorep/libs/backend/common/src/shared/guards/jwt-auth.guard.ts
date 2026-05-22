import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { IS_PUBLIC_KEY } from '@/shared/decorators/public.decorator';
import { GraphqlHttpContext } from '@/shared/graphql/graphql-http-context';
import { MESSAGES } from '@/shared/constants';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  getRequest(context: ExecutionContext) {
    if (context.getType<GqlContextType>() === 'graphql') {
      return GqlExecutionContext.create(
        context,
      ).getContext<GraphqlHttpContext>().req;
    }

    return context.switchToHttp().getRequest();
  }

  handleRequest<TUser = unknown>(err: Error | null, user: TUser) {
    if (err || !user) {
      throw err || new UnauthorizedException(MESSAGES.UNAUTHORIZED);
    }

    return user;
  }
}
