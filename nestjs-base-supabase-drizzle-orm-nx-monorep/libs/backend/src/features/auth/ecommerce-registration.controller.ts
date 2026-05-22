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
import { Role } from '@/shared/enums';
import { Messages } from '@/shared/decorators/messages.decorator';
import { MESSAGES } from '@/shared/constants';
import {
  ApiEnvelopeResponse,
  ApiErrorResponseDto,
} from '@/shared/dto/api-response.dto';
import { Public } from '@/shared/decorators/public.decorator';
import { AuthService } from './auth.service';
import { AuthSessionResponseDto } from './dto/auth-response.dto';
import { RegisterDto } from './dto/register.dto';

type RegistrationRequest = {
  ip?: string;
  user?: {
    id: string;
    roles: Role[];
    sessionId?: string;
  };
  get(header: string): string | undefined;
};

@ApiTags('auth')
@Controller('auth')
export class EcommerceRegistrationController {
  constructor(private readonly authService: AuthService) {}

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
    @Request() req: RegistrationRequest,
  ) {
    return this.authService.register(registerDto, {
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
  }
}
