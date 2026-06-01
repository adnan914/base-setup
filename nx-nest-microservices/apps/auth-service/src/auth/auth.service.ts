import { NatsEventPublisher } from '@ecommerce/common';
import {
  GRPC_SERVICES,
  LoginRequest,
  NATS_SUBJECTS,
  RefreshRequest,
  RegisterRequest,
  UserGrpcClient,
  UserResponse
} from '@ecommerce/contracts';
import { Inject, Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { firstValueFrom, retry, timeout } from 'rxjs';
import { TokenRepository } from './token.repository';

@Injectable()
export class AuthService implements OnModuleInit {
  private users!: UserGrpcClient;

  constructor(
    @Inject('USER_PACKAGE') private readonly userClient: ClientGrpc,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly tokens: TokenRepository,
    private readonly events: NatsEventPublisher
  ) {}

  onModuleInit() {
    this.users = this.userClient.getService<UserGrpcClient>(GRPC_SERVICES.user);
  }

  async register(payload: RegisterRequest) {
    const passwordHash = await bcrypt.hash(payload.password, this.config.get<number>('security.bcryptRounds') ?? 12);
    const user = await firstValueFrom(
      this.users
        .createUser({
          email: payload.email,
          passwordHash,
          firstName: payload.firstName,
          lastName: payload.lastName,
          role: payload.role
        })
        .pipe(timeout(3000), retry({ count: 2, delay: 100 }))
    );
    await this.events.publish(NATS_SUBJECTS.sendEmail, {
      type: 'welcome',
      to: user.email,
      userId: user.id
    });
    return this.issueTokens(user, payload);
  }

  async login(payload: LoginRequest) {
    const user = await firstValueFrom(
      this.users.getUserByEmail({ email: payload.email }).pipe(timeout(3000), retry({ count: 2, delay: 100 }))
    );
    const valid = await bcrypt.compare(payload.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    return this.issueTokens(user, payload);
  }

  async refresh(payload: RefreshRequest) {
    const decoded = await this.jwt.verifyAsync(payload.refreshToken, {
      secret: this.config.getOrThrow<string>('jwt.refreshSecret')
    });
    const activeTokens = await this.tokens.findActiveByUser(decoded.sub);
    const matching = await this.findMatchingRefreshToken(activeTokens, payload.refreshToken);
    if (!matching) throw new UnauthorizedException('Invalid refresh token');
    await this.tokens.revoke(matching.id);
    const user = await firstValueFrom(
      this.users.getUserByEmail({ email: decoded.email }).pipe(timeout(3000), retry({ count: 2, delay: 100 }))
    );
    return this.issueTokens(user, payload);
  }

  async validateToken(payload: { accessToken: string }) {
    try {
      const decoded = await this.jwt.verifyAsync(payload.accessToken, {
        secret: this.config.getOrThrow<string>('jwt.accessSecret')
      });
      return { valid: true, user: { id: decoded.sub, email: decoded.email, role: decoded.role } };
    } catch {
      throw new RpcException('Invalid token');
    }
  }

  private async issueTokens(user: UserResponse, requestMeta: { userAgent?: string; ipAddress?: string }) {
    const jwtPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwt.signAsync(jwtPayload, {
      secret: this.config.getOrThrow<string>('jwt.accessSecret'),
      expiresIn: this.config.get<string>('jwt.accessTtl') ?? '900s'
    });
    const refreshToken = await this.jwt.signAsync({ ...jwtPayload, jti: randomUUID() }, {
      secret: this.config.getOrThrow<string>('jwt.refreshSecret'),
      expiresIn: this.config.get<string>('jwt.refreshTtl') ?? '7d'
    });
    await this.tokens.createRefreshToken({
      userId: user.id,
      tokenHash: await bcrypt.hash(refreshToken, this.config.get<number>('security.bcryptRounds') ?? 12),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: requestMeta.userAgent,
      ipAddress: requestMeta.ipAddress
    });
    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role }
    };
  }

  private async findMatchingRefreshToken(tokens: Array<{ id: string; tokenHash: string }>, rawToken: string) {
    for (const token of tokens) {
      if (await bcrypt.compare(rawToken, token.tokenHash)) return token;
    }
    return undefined;
  }
}
