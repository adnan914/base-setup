import type { Request } from 'express';

export type AuditActor = {
  id?: string | null;
  email?: string | null;
  role?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export function buildAuditChanges(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): Record<string, { before: unknown; after: unknown }> | null {
  const changes = Object.keys(after).reduce<Record<string, { before: unknown; after: unknown }>>(
    (acc, key) => {
      const beforeValue = before[key] ?? null;
      const afterValue = after[key] ?? null;

      if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
        acc[key] = { before: beforeValue, after: afterValue };
      }

      return acc;
    },
    {},
  );

  return Object.keys(changes).length > 0 ? changes : null;
}

export function pickAuditSnapshot<T extends Record<string, unknown>, K extends keyof T>(
  source: T,
  keys: K[],
): Record<string, unknown> {
  return keys.reduce<Record<string, unknown>>((acc, key) => {
    acc[String(key)] = source[key] ?? null;
    return acc;
  }, {});
}

export function extractAuditActor(
  request: Request & {
    user?: {
      id?: string;
      email?: string;
      role?: string;
    };
  },
): AuditActor {
  const forwardedFor = request.headers['x-forwarded-for'];
  const ipAddress = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : typeof forwardedFor === 'string'
      ? forwardedFor.split(',')[0]?.trim() || null
      : request.ip || null;

  const userAgentHeader = request.headers['user-agent'];
  const userAgent = Array.isArray(userAgentHeader)
    ? userAgentHeader[0]
    : userAgentHeader || null;

  return {
    id: request.user?.id ?? null,
    email: request.user?.email ?? null,
    role: request.user?.role ?? null,
    ipAddress,
    userAgent,
  };
}

export function applyAuditActorSnapshotFallback(
  snapshot: Record<string, unknown> | null | undefined,
  actor?: AuditActor,
): Record<string, unknown> | null {
  if (!snapshot) {
    return null;
  }

  return {
    ...snapshot,
    created_by: snapshot.created_by ?? actor?.id ?? null,
    updated_by: snapshot.updated_by ?? actor?.id ?? null,
  };
}

export function resolveAuditModuleForActor(actor?: AuditActor): string {
  const role = String(actor?.role ?? '')
    .trim()
    .toUpperCase();

  if (role === 'SUPER_ADMIN') {
    return 'SUPER_ADMIN';
  }

  return 'ADMIN';
}
