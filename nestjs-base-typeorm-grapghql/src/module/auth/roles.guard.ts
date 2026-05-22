import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ConstantConfig } from 'src/lib/constant/constant.config';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private constant: ConstantConfig) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles) {
      return true;
    }

    const gqlContext = GqlExecutionContext.create(context);
    const user = gqlContext.getContext().req.user;

    if (!user || !user.role) {
      throw new UnauthorizedException(this.constant.role.error.informationError);
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new UnauthorizedException(this.constant.role.error.requiredRoleError);
    }
    return true;
  }
}
