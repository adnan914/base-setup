import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '@lib/users/feature-users';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import { Role, Token, User } from '@lib/core/database';
import {
  JwtUserPayload,
  RES_MESSAGES,
  S3Service,
  Status,
  TokenType,
} from '@lib/core/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private configService: ConfigService,

    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly s3Service: S3Service,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                               AUTH FLOW METHODS                            */
  /* -------------------------------------------------------------------------- */

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    if (!user.password) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) this.throwUnauthorized(RES_MESSAGES.INVALID_CREDENTIALS);

    if (user.status === Status.BLOCKED) {
      this.throwUnauthorized(RES_MESSAGES.ACCOUNT_BLOCKED);
    }

    if (user.status !== Status.ACTIVE) {
      this.throwUnauthorized(RES_MESSAGES.ACCOUNT_NOT_ACTIVE);
    }

    const tokens = await this.generateTokens(user);
    await this.storeTokens(user.id, tokens);

    await this.usersService.updateLastLogin(user.id);

    return {
      user: await this.sanitizeLoginUser(user),
      permissions: this.resolvePermissions(user),
      ...tokens,
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    const payload = await this.verifyRefreshToken(dto.refreshToken);

    const storedToken = await this.tokenRepository.findOne({
      where: {
        user_id: payload.id,
        token: dto.refreshToken,
        type: TokenType.REFRESH,
        used: false,
      },
    });

    if (!storedToken) {
      this.throwUnauthorized(RES_MESSAGES.INVALID_REFRESH_TOKEN);
    }

    const user = await this.usersService.findById(payload.id);
    if (!user) this.throwUnauthorized(RES_MESSAGES.INVALID_REFRESH_TOKEN);

    // Rotate only the submitted refresh token so parallel sessions do not
    // invalidate each other on every refresh.
    await this.tokenRepository.update(
      {
        user_id: payload.id,
        token: dto.refreshToken,
        type: TokenType.REFRESH,
        used: false,
      },
      { used: true },
    );

    const tokens = await this.generateTokens(user);
    await this.storeTokens(user.id, tokens);

    return {
      user: await this.sanitizeLoginUser(user),
      permissions: this.resolvePermissions(user),
      ...tokens,
    };
  }

  async logout(dto: LogoutDto) {
    const existingToken = await this.tokenRepository.findOne({
      where: {
        user_id: dto.userId,
        token: dto.token,
      },
    });

    if (!existingToken) {
      this.throwUnauthorized(RES_MESSAGES.INVALID_TOKEN_OR_USED);
    }

    await this.tokenRepository.delete({ user_id: dto.userId });
    return { message: RES_MESSAGES.LOGOUT_SUCCESS };
  }

  /* -------------------------------------------------------------------------- */
  /*                                TOKEN HELPERS                               */
  /* -------------------------------------------------------------------------- */

  private async generateTokens(user: User) {
    const payload = {
      id: user.id,
      email: user.email,
      role: this.resolveRoleName(user),
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION'),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION'),
    });

    return { accessToken, refreshToken };
  }

  private async storeTokens(
    userId: string,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    await this.tokenRepository.save([
      {
        token: tokens.accessToken,
        user_id: userId,
        type: TokenType.ACCESS,
      },
      {
        token: tokens.refreshToken,
        user_id: userId,
        type: TokenType.REFRESH,
      },
    ]);
  }

  private async verifyRefreshToken(refreshToken: string): Promise<JwtUserPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtUserPayload>(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
    } catch {
      this.throwUnauthorized(RES_MESSAGES.INVALID_TOKEN_OR_USED);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                              GENERAL HELPERS                                */
  /* -------------------------------------------------------------------------- */

  private sanitizeUser(user: User) {
    const { password: _password, ...safeUser } = user;
    void _password;
    return safeUser;
  }

  private throwUnauthorized(message: string): never {
    throw new UnauthorizedException(message);
  }

  private resolveRoleName(user: User): string | null {
    const role = (user as unknown as { role?: { name?: string } | string }).role;

    if (typeof role === 'string') {
      return role;
    }

    if (role && typeof role.name === 'string') {
      return role.name;
    }

    return null;
  }

  private async sanitizeLoginUser(user: User) {
    const safeUser = this.sanitizeUser(user) as User & {
      role?: Pick<Role, 'id' | 'name'> | string | null;
      profileImageUrl?: string | null;
    };
    const { profile_image_url, ...restUser } = safeUser as typeof safeUser & {
      profile_image_url?: string | null;
    };

    let profileImageUrl = profile_image_url ?? null;
    if (profileImageUrl && !profileImageUrl.startsWith('data:') && !profileImageUrl.startsWith('http')) {
      profileImageUrl = await this.s3Service.getPresignedUrl(profileImageUrl);
    }

    const role = restUser.role;

    return {
      ...restUser,
      profileImageUrl: profileImageUrl,
      role:
        role && typeof role === 'object'
          ? {
              id: role.id ?? null,
              name: role.name ?? null,
            }
          : role
            ? {
                id: null,
                name: String(role),
            }
          : null,
    };
  }

  private resolvePermissions(user: User): string[] {
    const role = user as User & {
      role?: {
        permissions?: Array<{
          access_allowed?: boolean;
          module?: { name?: string | null } | null;
        }>;
      } | string | null;
    };

    if (!role.role || typeof role.role === 'string') {
      return [];
    }

    return (role.role.permissions ?? [])
      .filter((permission) => permission.access_allowed)
      .map((permission) => permission.module?.name)
      .filter((name): name is string => Boolean(name));
  }
}
