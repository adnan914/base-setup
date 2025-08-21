import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly allowed: string[] = []) { }
    canActivate(ctx: ExecutionContext): boolean {
        const req = ctx.switchToHttp().getRequest();
        const user = req.user;
        if (!user || !this.allowed.includes(user.role)) {
            throw new ForbiddenException('Insufficient role');
        }
        return true;
    }
}
