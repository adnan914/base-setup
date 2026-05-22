import { Injectable } from '@nestjs/common';
import { and, eq, gt, isNull } from 'drizzle-orm';
import {
  AuthSession,
  authSessions,
  DatabaseService,
  NewAuthSession,
} from '@/database';
import { SessionRevocationReason } from '@/shared/enums';

@Injectable()
export class AuthSessionsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(values: NewAuthSession): Promise<AuthSession> {
    const [session] = await this.databaseService.db
      .insert(authSessions)
      .values(values)
      .returning();

    return session;
  }

  async findById(id: string): Promise<AuthSession | null> {
    const [session] = await this.databaseService.db
      .select()
      .from(authSessions)
      .where(eq(authSessions.id, id))
      .limit(1);

    return session ?? null;
  }

  async isActive(id: string, userId: string): Promise<boolean> {
    const [session] = await this.databaseService.db
      .select({ id: authSessions.id })
      .from(authSessions)
      .where(
        and(
          eq(authSessions.id, id),
          eq(authSessions.userId, userId),
          isNull(authSessions.revokedAt),
          gt(authSessions.expiresAt, new Date()),
        ),
      )
      .limit(1);

    return Boolean(session);
  }

  async rotate(
    id: string,
    currentRefreshTokenId: string,
    refreshTokenHash: string,
    refreshTokenId: string,
    expiresAt: Date,
  ): Promise<boolean> {
    const [rotatedSession] = await this.databaseService.db
      .update(authSessions)
      .set({
        refreshTokenHash,
        refreshTokenId,
        expiresAt,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(authSessions.id, id),
          eq(authSessions.refreshTokenId, currentRefreshTokenId),
          isNull(authSessions.revokedAt),
          gt(authSessions.expiresAt, new Date()),
        ),
      )
      .returning({ id: authSessions.id });

    return Boolean(rotatedSession);
  }

  async revoke(id: string, reason: SessionRevocationReason) {
    await this.databaseService.db
      .update(authSessions)
      .set({
        revokedAt: new Date(),
        revokedReason: reason,
        updatedAt: new Date(),
      })
      .where(and(eq(authSessions.id, id), isNull(authSessions.revokedAt)));
  }
}
