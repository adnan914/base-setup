import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { UsersService } from '@/features/users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { PublicUser, User } from '@/database';
import { Status } from '@/shared/enums';
import { MESSAGES } from '@/shared/constants';
import { AuthSessionsService } from './auth-sessions.service';

type SessionMetadata = {
  ipAddress?: string;
  userAgent?: string;
};

type RefreshTokenPayload = {
  exp?: number;
  jti?: string;
  sid?: string;
  sub: string;
  type: 'refresh';
};

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private authSessionsService: AuthSessionsService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<PublicUser | null> {
    const user = await this.usersService.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _pw, ...result } = user;
      return result;
    }

    return null;
  }

  async login(loginDto: LoginDto, metadata: SessionMetadata = {}) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException(MESSAGES.INVALID_CREDENTIALS);
    }

    if (user.status !== Status.ACTIVE) {
      throw new UnauthorizedException(MESSAGES.ACCOUNT_INACTIVE);
    }

    const sessionId = randomUUID();
    const tokens = await this.generateTokens(user, sessionId);

    await this.usersService.updateLastLogin(user.id);
    await this.authSessionsService.create({
      id: sessionId,
      userId: user.id,
      refreshTokenHash: await bcrypt.hash(tokens.refreshToken, 12),
      refreshTokenId: tokens.refreshTokenId,
      expiresAt: tokens.refreshTokenExpiresAt,
      ...metadata,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        status: user.status,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async register(registerDto: RegisterDto, metadata: SessionMetadata = {}) {
    const user = await this.usersService.create(registerDto);

    const sessionId = randomUUID();
    const tokens = await this.generateTokens(user, sessionId);

    await this.authSessionsService.create({
      id: sessionId,
      userId: user.id,
      refreshTokenHash: await bcrypt.hash(tokens.refreshToken, 12),
      refreshTokenId: tokens.refreshTokenId,
      expiresAt: tokens.refreshTokenExpiresAt,
      ...metadata,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        status: user.status,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshTokenDto.refreshToken,
        {
          secret: this.configService.getOrThrow<string>('JWT_SECRET'),
        },
      );

      if (
        payload.type !== 'refresh' ||
        !payload.sid ||
        !payload.jti ||
        !payload.exp
      ) {
        throw new UnauthorizedException(MESSAGES.INVALID_REFRESH_TOKEN);
      }

      const user = await this.usersService.findAuthById(payload.sub);
      const session = await this.authSessionsService.findById(payload.sid);

      if (
        !session ||
        session.userId !== user.id ||
        session.revokedAt ||
        session.expiresAt <= new Date()
      ) {
        throw new UnauthorizedException(MESSAGES.INVALID_REFRESH_TOKEN);
      }

      if (
        session.refreshTokenId !== payload.jti ||
        !(await bcrypt.compare(
          refreshTokenDto.refreshToken,
          session.refreshTokenHash,
        ))
      ) {
        await this.authSessionsService.revoke(
          session.id,
          'refresh-token-reuse',
        );
        throw new UnauthorizedException(MESSAGES.INVALID_REFRESH_TOKEN);
      }

      const tokens = await this.generateTokens(user, session.id);

      await this.authSessionsService.rotate(
        session.id,
        await bcrypt.hash(tokens.refreshToken, 12),
        tokens.refreshTokenId,
        tokens.refreshTokenExpiresAt,
      );

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch {
      throw new UnauthorizedException(MESSAGES.INVALID_REFRESH_TOKEN);
    }
  }

  async logout(userId: string, sessionId?: string) {
    if (sessionId) {
      const session = await this.authSessionsService.findById(sessionId);

      if (session?.userId === userId) {
        await this.authSessionsService.revoke(sessionId, 'logout');
      }
    }

    return { message: MESSAGES.LOGOUT_SUCCESS };
  }

  private async generateTokens(user: User | PublicUser, sessionId: string) {
    const payload = {
      email: user.email,
      sub: user.id,
      roles: user.roles,
      sid: sessionId,
    };
    const refreshTokenId = randomUUID();

    const accessTokenExpiresIn = this.configService.getOrThrow<string>(
      'JWT_ACCESS_TOKEN_EXPIRES_IN',
    ) as any;
    const refreshTokenExpiresIn = this.configService.getOrThrow<string>(
      'JWT_REFRESH_TOKEN_EXPIRES_IN',
    ) as any;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { ...payload, type: 'access' },
        {
          expiresIn: accessTokenExpiresIn,
        },
      ),
      this.jwtService.signAsync(
        { ...payload, jti: refreshTokenId, type: 'refresh' },
        {
          expiresIn: refreshTokenExpiresIn,
        },
      ),
    ]);
    const refreshTokenPayload =
      this.jwtService.decode<RefreshTokenPayload>(refreshToken);

    return {
      accessToken,
      refreshToken,
      refreshTokenId,
      refreshTokenExpiresAt: this.getRefreshTokenExpiry(refreshTokenPayload),
    };
  }

  private getRefreshTokenExpiry(payload: RefreshTokenPayload | null) {
    if (!payload?.exp) {
      throw new UnauthorizedException(MESSAGES.INVALID_REFRESH_TOKEN_EXPIRY);
    }

    return new Date(payload.exp * 1000);
  }
}
