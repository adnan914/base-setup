import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '@/features/users/users.service';
import { Role, Status } from '@/shared/enums';

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
    refreshToken: null,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let service: AuthService;
  let usersService: jest.Mocked<Partial<UsersService>>;
  let jwtService: jest.Mocked<Partial<JwtService>>;

  beforeEach(() => {
    usersService = {
      findByEmail: jest.fn(),
      findAuthById: jest.fn(),
      updateRefreshToken: jest.fn(),
    };
    jwtService = {
      verifyAsync: jest.fn(),
      signAsync: jest.fn(),
    };

    service = new AuthService(
      usersService as unknown as UsersService,
      jwtService as unknown as JwtService,
      {
        getOrThrow: jest.fn((key: string) => {
          const values = {
            JWT_SECRET: 'test-secret-that-is-long-enough-for-service-tests',
            JWT_ACCESS_TOKEN_EXPIRES_IN: '15m',
            JWT_REFRESH_TOKEN_EXPIRES_IN: '7d',
          };
          return values[key];
        }),
      } as unknown as ConfigService,
    );
  });

  it('does not expose password or refresh token after credential validation', async () => {
    const password = 'Use-A-Long-Password-123';
    usersService.findByEmail.mockResolvedValue({
      ...user,
      password: await bcrypt.hash(password, 4),
      refreshToken: 'stored-refresh-token-hash',
    });

    const validatedUser = await service.validateUser(user.email, password);

    expect(validatedUser).not.toHaveProperty('password');
    expect(validatedUser).not.toHaveProperty('refreshToken');
  });

  it('rejects access tokens at the refresh endpoint', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: user.id, type: 'access' });

    await expect(
      service.refreshToken({ refreshToken: 'access-token' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rotates and stores refresh tokens as hashes', async () => {
    const previousRefreshToken = 'previous-refresh-token';
    usersService.findAuthById.mockResolvedValue({
      ...user,
      refreshToken: await bcrypt.hash(previousRefreshToken, 4),
    });
    jwtService.verifyAsync.mockResolvedValue({
      sub: user.id,
      type: 'refresh',
    });
    jwtService.signAsync
      .mockResolvedValueOnce('next-access-token')
      .mockResolvedValueOnce('next-refresh-token');

    const tokens = await service.refreshToken({
      refreshToken: previousRefreshToken,
    });
    const storedHash = usersService.updateRefreshToken.mock.calls[0][1];

    expect(tokens).toEqual({
      accessToken: 'next-access-token',
      refreshToken: 'next-refresh-token',
    });
    expect(storedHash).not.toBe('next-refresh-token');
    await expect(
      bcrypt.compare('next-refresh-token', storedHash),
    ).resolves.toBe(true);
  });
});
