import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "../enums";
import { ROLES_KEY } from "../decorators";

const ROLE_ALIASES: Record<string, string[]> = {};

const normalizeRoleCandidates = (role?: string | null): string[] => {
  if (typeof role !== "string") {
    return [];
  }

  const normalized = role.trim().toUpperCase();
  if (!normalized) {
    return [];
  }

  return [normalized, ...(ROLE_ALIASES[normalized] ?? [])];
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles from @Roles decorator metadata
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles specified, allow access
    if (!requiredRoles) {
      return true;
    }

    // Extract user from request (populated by JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();
    const userRole =
      typeof user?.role === "string"
        ? user.role
        : typeof user?.role?.name === "string"
          ? user.role.name
          : null;
    const userRoleCandidates = new Set(normalizeRoleCandidates(userRole));

    // Check if user's role matches any required role
    return requiredRoles.some((role) =>
      normalizeRoleCandidates(role).some((candidate) => userRoleCandidates.has(candidate)),
    );
  }
}
