import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
// import {
//   ApiTags,
//   ApiOperation,
//   ApiResponse,
//   ApiBearerAuth,
// } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Messages } from '@/shared/decorators/messages.decorator';
import { MESSAGES } from '@/shared/constants';
import { LocalAuthGuard } from '@/shared/guards/local-auth.guard';
import { Public } from '@/shared/decorators/public.decorator';
import { Role } from '@/shared/enums';

type AuthenticatedRequest = {
  ip?: string;
  user: {
    id: string;
    roles: Role[];
    sessionId?: string;
  };
  get(header: string): string | undefined;
};

// @ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @Messages(MESSAGES.LOGIN_SUCCESS)
  async login(
    @Body() loginDto: LoginDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.authService.login(loginDto, this.getSessionMetadata(req));
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  @Messages(MESSAGES.CREATED)
  async register(
    @Body() registerDto: RegisterDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.authService.register(registerDto, this.getSessionMetadata(req));
  }

  @Public()
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Post('refresh')
  @Messages(MESSAGES.REFRESH_SUCCESS)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  @Messages(MESSAGES.LOGOUT_SUCCESS)
  async logout(@Request() req: AuthenticatedRequest) {
    return this.authService.logout(req.user.id, req.user.sessionId);
  }

  private getSessionMetadata(req: AuthenticatedRequest) {
    return {
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    };
  }
}
