import { Controller, Post, Body } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
// import { RegisterDto } from "./dto/register.dto";
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import { RES_MESSAGES, Messages, IsPublic, SWAGGER_MESSAGES } from '@lib/core/common';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @IsPublic()
  @Post('login')
  @ApiOperation({ summary: SWAGGER_MESSAGES.AUTH_LOGIN })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: RES_MESSAGES.LOGIN_SUCCESS })
  @ApiBadRequestResponse({ description: RES_MESSAGES.VALIDATION_ERROR })
  @ApiUnauthorizedResponse({ description: RES_MESSAGES.INVALID_CREDENTIALS })
  @Messages(RES_MESSAGES.LOGIN_SUCCESS)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // @IsPublic()
  // @Post('register')
  // @Messages(RES_MESSAGES.CREATED)
  // async register(@Body() body: RegisterDto) {
  //   return this.authService.register(body);
  // }

  @Post('refresh')
  @ApiOperation({ summary: SWAGGER_MESSAGES.AUTH_REFRESH })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({ description: RES_MESSAGES.REFRESH_SUCCESS })
  @ApiBadRequestResponse({ description: RES_MESSAGES.VALIDATION_ERROR })
  @ApiUnauthorizedResponse({ description: RES_MESSAGES.INVALID_REFRESH_TOKEN })
  @Messages(RES_MESSAGES.REFRESH_SUCCESS)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  @ApiOperation({ summary: SWAGGER_MESSAGES.AUTH_LOGOUT })
  @ApiBody({ type: LogoutDto })
  @ApiOkResponse({ description: RES_MESSAGES.LOGOUT_SUCCESS })
  @ApiBadRequestResponse({ description: RES_MESSAGES.VALIDATION_ERROR })
  @Messages(RES_MESSAGES.LOGOUT_SUCCESS)
  async logout(@Body() logoutDto: LogoutDto) {
    return this.authService.logout(logoutDto);
  }
}
