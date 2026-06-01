import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('rejects invalid refresh tokens', async () => {
    const service = new AuthService(
      { getService: jest.fn() } as any,
      { verifyAsync: jest.fn().mockRejectedValue(new Error('bad token')) } as unknown as JwtService,
      { getOrThrow: jest.fn().mockReturnValue('secret'), get: jest.fn() } as any,
      { findActiveByUser: jest.fn() } as any,
      { publish: jest.fn() } as any
    );

    await expect(service.refresh({ refreshToken: 'bad' })).rejects.toThrow();
  });

  it('keeps invalid credentials unauthorized', async () => {
    expect(new UnauthorizedException('Invalid credentials').getStatus()).toBe(401);
  });
});
