import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '@/features/users/users.service';
import { Role, SessionRevocationReason, Status } from '@/shared/enums';
import { AuthSessionsService } from './auth-sessions.service';

describe('AuthService', () => {
  const user = {
    id: '67e55044-10b1-426f-9247-bb680e5fe0c8',
    email: 'user@example.com',
    firstName: 'Base',
    lastName: 'User',
    password: '',
    roles: [Role.USER],
    status: Status.ACTIVE,
    profileImg: null,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let service: AuthService;
  let usersService: {
    findAuthById: jest.Mock;
    findByEmail: jest.Mock;
  };
  let jwtService: {
    decode: jest.Mock;
    signAsync: jest.Mock;
    verifyAsync: jest.Mock;
  };
  let authSessionsService: {
    findById: jest.Mock;
    revoke: jest.Mock;
    rotate: jest.Mock;
  };

  beforeEach(() => {
    usersService = {
      findByEmail: jest.fn(),
      findAuthById: jest.fn(),
    };
    jwtService = {
      verifyAsync: jest.fn(),
      signAsync: jest.fn(),
      decode: jest.fn(),
    };
    authSessionsService = {
      findById: jest.fn(),
      revoke: jest.fn(),
      rotate: jest.fn().mockResolvedValue(true),
    };

    service = new AuthService(
      usersService as unknown as UsersService,
      jwtService as unknown as JwtService,
      {
        getOrThrow: jest.fn((key: string) => {
          const values: Record<string, string> = {
            JWT_SECRET: 'test-secret-that-is-long-enough-for-service-tests',
            JWT_ACCESS_TOKEN_EXPIRES_IN: '15m',
            JWT_REFRESH_TOKEN_EXPIRES_IN: '7d',
          };
          return values[key];
        }),
      } as unknown as ConfigService,
      authSessionsService as unknown as AuthSessionsService,
    );
  });

  it('does not expose password or refresh token after credential validation', async () => {
    const password = 'Use-A-Long-Password-123';
    usersService.findByEmail.mockResolvedValue({
      ...user,
      password: await bcrypt.hash(password, 4),
    });

    const validatedUser = await service.validateUser(user.email, password);

    expect(validatedUser).not.toHaveProperty('password');
  });

  it('rejects access tokens at the refresh endpoint', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: user.id, type: 'access' });

    await expect(
      service.refreshToken({ refreshToken: 'access-token' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rotates and stores refresh tokens as hashes', async () => {
    const previousRefreshToken = 'previous-refresh-token';
    const refreshTokenId = 'e13e8a3c-24f2-41ea-a99a-7511642ed233';
    const sessionId = '3bec3bb2-6a63-4f83-8706-0de54b2d8ab8';

    usersService.findAuthById.mockResolvedValue(user);
    jwtService.verifyAsync.mockResolvedValue({
      sub: user.id,
      sid: sessionId,
      jti: refreshTokenId,
      exp: Math.floor(Date.now() / 1000) + 60,
      type: 'refresh',
    });
    authSessionsService.findById.mockResolvedValue({
      id: sessionId,
      userId: user.id,
      refreshTokenHash: await bcrypt.hash(previousRefreshToken, 4),
      refreshTokenId,
      expiresAt: new Date(Date.now() + 60000),
      revokedAt: null,
      revokedReason: null,
      ipAddress: null,
      userAgent: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    jwtService.signAsync
      .mockResolvedValueOnce('next-access-token')
      .mockResolvedValueOnce('next-refresh-token');
    jwtService.decode.mockReturnValue({
      exp: Math.floor(Date.now() / 1000) + 60,
      type: 'refresh',
    });

    const tokens = await service.refreshToken({
      refreshToken: previousRefreshToken,
    });
    const storedHash = authSessionsService.rotate.mock.calls[0][2];

    if (typeof storedHash !== 'string') {
      throw new Error('Expected a rotated refresh token hash');
    }

    expect(tokens).toEqual({
      accessToken: 'next-access-token',
      refreshToken: 'next-refresh-token',
    });
    expect(storedHash).not.toBe('next-refresh-token');
    expect(authSessionsService.rotate).toHaveBeenCalledWith(
      sessionId,
      refreshTokenId,
      expect.any(String),
      expect.any(String),
      expect.any(Date),
    );
    await expect(
      bcrypt.compare('next-refresh-token', storedHash),
    ).resolves.toBe(true);
  });

  it('revokes a refresh session when a rotated token is reused', async () => {
    const sessionId = '3bec3bb2-6a63-4f83-8706-0de54b2d8ab8';

    usersService.findAuthById.mockResolvedValue(user);
    jwtService.verifyAsync.mockResolvedValue({
      sub: user.id,
      sid: sessionId,
      jti: 'old-token-id',
      exp: Math.floor(Date.now() / 1000) + 60,
      type: 'refresh',
    });
    authSessionsService.findById.mockResolvedValue({
      id: sessionId,
      userId: user.id,
      refreshTokenHash: await bcrypt.hash('new-refresh-token', 4),
      refreshTokenId: 'new-token-id',
      expiresAt: new Date(Date.now() + 60000),
      revokedAt: null,
      revokedReason: null,
      ipAddress: null,
      userAgent: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      service.refreshToken({ refreshToken: 'old-refresh-token' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(authSessionsService.revoke).toHaveBeenCalledWith(
      sessionId,
      SessionRevocationReason.REFRESH_TOKEN_REUSE,
    );
  });

  it('revokes a refresh session when conditional rotation loses a race', async () => {
    const previousRefreshToken = 'previous-refresh-token';
    const refreshTokenId = 'e13e8a3c-24f2-41ea-a99a-7511642ed233';
    const sessionId = '3bec3bb2-6a63-4f83-8706-0de54b2d8ab8';

    usersService.findAuthById.mockResolvedValue(user);
    jwtService.verifyAsync.mockResolvedValue({
      sub: user.id,
      sid: sessionId,
      jti: refreshTokenId,
      exp: Math.floor(Date.now() / 1000) + 60,
      type: 'refresh',
    });
    authSessionsService.findById.mockResolvedValue({
      id: sessionId,
      userId: user.id,
      refreshTokenHash: await bcrypt.hash(previousRefreshToken, 4),
      refreshTokenId,
      expiresAt: new Date(Date.now() + 60000),
      revokedAt: null,
      revokedReason: null,
      ipAddress: null,
      userAgent: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    authSessionsService.rotate.mockResolvedValue(false);
    jwtService.signAsync
      .mockResolvedValueOnce('next-access-token')
      .mockResolvedValueOnce('next-refresh-token');
    jwtService.decode.mockReturnValue({
      exp: Math.floor(Date.now() / 1000) + 60,
      type: 'refresh',
    });

    await expect(
      service.refreshToken({ refreshToken: previousRefreshToken }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(authSessionsService.revoke).toHaveBeenCalledWith(
      sessionId,
      SessionRevocationReason.REFRESH_TOKEN_REUSE,
    );
  });
});
