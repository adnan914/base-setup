import { PrismaService } from '@ecommerce/database';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  createRefreshToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }) {
    return this.prisma.refreshToken.create({ data });
  }

  findActiveByUser(userId: string) {
    return this.prisma.refreshToken.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' }
    });
  }

  revoke(id: string) {
    return this.prisma.refreshToken.update({ where: { id }, data: { revokedAt: new Date() } });
  }
}
