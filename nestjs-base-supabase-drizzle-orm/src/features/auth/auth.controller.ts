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
import {
  AuthSessionResponseDto,
  AuthTokensResponseDto,
  LogoutResponseDto,
} from './dto/auth-response.dto';
import { Messages } from '@/shared/decorators/messages.decorator';
import { MESSAGES } from '@/shared/constants';
import {
  ApiEnvelopeResponse,
  ApiErrorResponseDto,
} from '@/shared/dto/api-response.dto';
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

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({
    summary: 'Login with email and password',
    description: 'Creates an authenticated session and returns JWT tokens.',
  })
  @ApiBody({ type: LoginDto })
  @ApiEnvelopeResponse({
    description: 'Authenticated session created.',
    message: MESSAGES.LOGIN_SUCCESS,
    status: 201,
    type: AuthSessionResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Login payload validation failed.',
    type: ApiErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Credentials are invalid or the account is not active.',
    type: ApiErrorResponseDto,
  })
  @ApiResponse({
    description: 'Too many login attempts.',
    status: 429,
    type: ApiErrorResponseDto,
  })
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
  @ApiOperation({
    summary: 'Register a user account',
    description: 'Creates a user and starts an authenticated session.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiEnvelopeResponse({
    description: 'User account created.',
    message: MESSAGES.CREATED,
    status: 201,
    type: AuthSessionResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Registration payload validation failed.',
    type: ApiErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'A user with the provided email already exists.',
    type: ApiErrorResponseDto,
  })
  @ApiResponse({
    description: 'Too many registration attempts.',
    status: 429,
    type: ApiErrorResponseDto,
  })
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
  @ApiOperation({
    summary: 'Refresh JWT tokens',
    description: 'Rotates a refresh token and returns the next token pair.',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiEnvelopeResponse({
    description: 'Refresh token rotated.',
    message: MESSAGES.REFRESH_SUCCESS,
    status: 201,
    type: AuthTokensResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Refresh payload validation failed.',
    type: ApiErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Refresh token is invalid, expired, or already rotated.',
    type: ApiErrorResponseDto,
  })
  @ApiResponse({
    description: 'Too many refresh attempts.',
    status: 429,
    type: ApiErrorResponseDto,
  })
  @Messages(MESSAGES.REFRESH_SUCCESS)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout current session',
    description: 'Revokes the current authenticated refresh session.',
  })
  @ApiEnvelopeResponse({
    description: 'Current session logout handled.',
    message: MESSAGES.LOGOUT_SUCCESS,
    status: 201,
    type: LogoutResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Bearer token is missing or invalid.',
    type: ApiErrorResponseDto,
  })
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
