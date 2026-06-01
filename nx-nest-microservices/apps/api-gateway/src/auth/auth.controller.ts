import { callWithCircuitBreaker } from '@ecommerce/common';
import { AuthGrpcClient, GRPC_SERVICES } from '@ecommerce/contracts';
import { LoginDto, RefreshTokenDto, RegisterDto } from '@ecommerce/dto';
import { Body, Controller, Inject, OnModuleInit, Post, Req } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Request } from 'express';

@Controller('auth')
export class AuthController implements OnModuleInit {
  private auth!: AuthGrpcClient;

  constructor(@Inject('AUTH_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.auth = this.client.getService<AuthGrpcClient>(GRPC_SERVICES.auth);
  }

  @Post('register')
  register(@Body() dto: RegisterDto, @Req() req: Request) {
    return callWithCircuitBreaker(() =>
      this.auth.register({ ...dto, userAgent: req.headers['user-agent'], ipAddress: req.ip })
    );
  }

  @Post('login')
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return callWithCircuitBreaker(() =>
      this.auth.login({ ...dto, userAgent: req.headers['user-agent'], ipAddress: req.ip })
    );
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    return callWithCircuitBreaker(() =>
      this.auth.refresh({ ...dto, userAgent: req.headers['user-agent'], ipAddress: req.ip })
    );
  }
}
