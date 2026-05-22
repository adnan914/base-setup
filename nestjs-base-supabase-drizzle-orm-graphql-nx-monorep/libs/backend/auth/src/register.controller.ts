import { Body, Controller, Post, Request } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthSessionResponseDto } from './dto/auth-response.dto';
import { RegisterDto } from './dto/register.dto';
import { ApiEnvelopeResponse } from '@/shared/decorators/api-envelope-response.decorator';
import { Messages } from '@/shared/decorators/messages.decorator';
import { Public } from '@/shared/decorators/public.decorator';
import { MESSAGES } from '@/shared/constants';
import { ApiErrorResponseDto } from '@/shared/dto/api-response.dto';

type RegistrationRequest = {
  ip?: string;
  get(header: string): string | undefined;
};

@ApiTags('auth')
@Controller('auth')
export class RegisterController {
  constructor(private readonly authService: AuthService) {}

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
  register(
    @Body() registerDto: RegisterDto,
    @Request() req: RegistrationRequest,
  ) {
    return this.authService.register(registerDto, {
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
  }
}
