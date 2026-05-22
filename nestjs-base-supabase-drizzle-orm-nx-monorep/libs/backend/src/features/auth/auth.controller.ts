import { Controller, Post, Body, Request } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import {
  AuthTokensResponseDto,
  LogoutResponseDto,
} from './dto/auth-response.dto';
import { Messages } from '@/shared/decorators/messages.decorator';
import { MESSAGES } from '@/shared/constants';
import {
  ApiEnvelopeResponse,
  ApiErrorResponseDto,
} from '@/shared/dto/api-response.dto';
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
}
