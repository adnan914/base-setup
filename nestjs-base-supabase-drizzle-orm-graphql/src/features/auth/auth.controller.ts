import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Messages } from '@/shared/decorators/messages.decorator';
import { MESSAGES } from '@/shared/constants';
import { LocalAuthGuard } from '@/shared/guards/local-auth.guard';
import { Public } from '@/shared/decorators/public.decorator';
import { Role } from '@/shared/enums';
import {
  AuthSessionResponseDto,
  AuthTokensResponseDto,
  LogoutResponseDataDto,
} from './dto/auth-response.dto';
import { ApiEnvelopeResponse } from '@/shared/decorators/api-envelope-response.decorator';
import { ApiErrorResponseDto } from '@/shared/dto/api-response.dto';

type AuthenticatedRequest = {
  ip?: string;
  user: {
    id: string;
    roles: Role[];
    sessionId?: string;
  };
  get(header: string): string | undefined;
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @Messages(MESSAGES.LOGIN_SUCCESS)
  @ApiOperation({
    summary: 'Login with email and password',
    description:
      'Creates an authenticated session and returns access and rotating refresh tokens.',
  })
  @ApiBody({ type: LoginDto })
  @ApiEnvelopeResponse({
    status: 200,
    description: 'User authenticated and session tokens returned.',
    type: AuthSessionResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Login payload validation failed.',
    type: ApiErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Credentials are invalid or the account cannot login.',
    type: ApiErrorResponseDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Login rate limit exceeded.',
    type: ApiErrorResponseDto,
  })
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
  @ApiOperation({
    summary: 'Register a user account',
    description:
      'Creates a user session for the new account. Public registration cannot assign roles.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiEnvelopeResponse({
    status: 201,
    description: 'User account created and session tokens returned.',
    type: AuthSessionResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Registration payload validation failed.',
    type: ApiErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'An account with the provided email already exists.',
    type: ApiErrorResponseDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Registration rate limit exceeded.',
    type: ApiErrorResponseDto,
  })
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
  @ApiOperation({
    summary: 'Rotate refresh token',
    description:
      'Validates the current refresh token, rotates the session token, and returns fresh tokens.',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiEnvelopeResponse({
    status: 201,
    description: 'Refresh token accepted and rotated tokens returned.',
    type: AuthTokensResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Refresh payload validation failed.',
    type: ApiErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Refresh token is invalid, expired, revoked, or reused.',
    type: ApiErrorResponseDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Refresh rate limit exceeded.',
    type: ApiErrorResponseDto,
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  @Messages(MESSAGES.LOGOUT_SUCCESS)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout current session',
    description: 'Revokes the current authenticated session refresh access.',
  })
  @ApiEnvelopeResponse({
    status: 201,
    description: 'Current session logout processed.',
    type: LogoutResponseDataDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Access token is missing, invalid, expired, or revoked.',
    type: ApiErrorResponseDto,
  })
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
