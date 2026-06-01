import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enums';

/**
 * Roles Decorator
 * 
 * Custom decorator to attach role metadata to route handlers.
 * Used in conjunction with RolesGuard to enforce role-based access control.
 * 
 * Usage:
 * @Roles(UserRole.ADMIN)
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * async adminOnlyRoute() { ... }
 * 
 * Why it exists:
 * - Provides a clean, declarative way to specify required roles
 * - Metadata is read by RolesGuard to enforce authorization
 * - Follows NestJS best practices for custom decorators
 * 
 * Architectural responsibility:
 * - Part of the authorization layer in the modular monolith
 * - Shared across all modules that need role-based protection
 * - Lives in core/common as it's a cross-cutting concern
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
