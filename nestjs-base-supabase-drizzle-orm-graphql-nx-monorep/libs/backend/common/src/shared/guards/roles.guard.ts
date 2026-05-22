import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Role } from '@/shared/enums';
import { ROLES_KEY } from '@/shared/decorators/roles.decorator';
import { GraphqlHttpContext } from '@/shared/graphql/graphql-http-context';

type RequestWithRoles = {
  user?: {
    roles?: Role[];
  };
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles?.length) {
      return true;
    }

    const request = this.getRequest(context);
    const userRoles = request.user?.roles ?? [];

    return requiredRoles.some((role) => userRoles.includes(role));
  }

  private getRequest(context: ExecutionContext): RequestWithRoles {
    if (context.getType<GqlContextType>() === 'graphql') {
      return GqlExecutionContext.create(
        context,
      ).getContext<GraphqlHttpContext>().req as RequestWithRoles;
    }

    return context.switchToHttp().getRequest<RequestWithRoles>();
  }
}
