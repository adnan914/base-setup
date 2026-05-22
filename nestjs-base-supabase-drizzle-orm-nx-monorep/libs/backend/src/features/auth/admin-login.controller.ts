import {
  Body,
  Controller,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from '@/shared/enums';
import { Messages } from '@/shared/decorators/messages.decorator';
import { MESSAGES } from '@/shared/constants';
import {
  ApiEnvelopeResponse,
  ApiErrorResponseDto,
} from '@/shared/dto/api-response.dto';
import { LocalAuthGuard } from '@/shared/guards/local-auth.guard';
import { Public } from '@/shared/decorators/public.decorator';
import { AuthService } from './auth.service';
import { AuthSessionResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';

type AdminLoginRequest = {
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
export class AdminLoginController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({
    summary: 'Login to admin API',
    description: 'Creates an admin session and returns JWT tokens.',
  })
  @ApiBody({ type: LoginDto })
  @ApiEnvelopeResponse({
    description: 'Authenticated admin session created.',
    message: MESSAGES.LOGIN_SUCCESS,
    status: 201,
    type: AuthSessionResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Login payload validation failed.',
    type: ApiErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Credentials are invalid or admin access is unavailable.',
    type: ApiErrorResponseDto,
  })
  @ApiResponse({
    description: 'Too many login attempts.',
    status: 429,
    type: ApiErrorResponseDto,
  })
  @Messages(MESSAGES.LOGIN_SUCCESS)
  async login(@Body() loginDto: LoginDto, @Request() req: AdminLoginRequest) {
    if (!req.user.roles.includes(Role.ADMIN)) {
      throw new UnauthorizedException(MESSAGES.INVALID_CREDENTIALS);
    }

    return this.authService.login(loginDto, {
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
  }
}
