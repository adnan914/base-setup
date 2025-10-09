/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  ConflictException,
  Put,
  ForbiddenException,
  Param,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/CreateUser.dto';
import { UsersService } from './users.service';
import { LocalAuthGuard } from '../auth/local-auth.guard';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UpdateUserDto } from './dtos/UpdateUser.dto';
import { RefreshTokenGuard } from '../auth/refresh-token.guard';
import { EmailService } from '../../lib/Utils/sendgrid/email.service';
import { ConstantConfig } from '../../lib/constant/constant.config';
import { TwilioService } from '../../lib/Utils/twilio/twilio.service';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private emailService: EmailService,
    private constant:ConstantConfig,
    private twilioService: TwilioService
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager', 'lead')
  @Get()
  async getUsers() {
    try {
      const users = await this.usersService.findUsers();
      return { success: true, data: users };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Post('signup')
  async signUpUser(@Body() createUserDto: CreateUserDto) {
    try {
      const existingUser = await this.usersService.findUserByEmail(
        createUserDto.email,
      );
      if (existingUser) {
        throw new ConflictException(this.constant.error.auth.emailExists);
      }
      const newUserDetails = {
        ...createUserDto,
      };
      const newUser = await this.usersService.createUser(newUserDetails);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req): Promise<any> {
    try {
      const user = req.user;
      if (!user) {
        throw new Error();
      }
 const result = await this.authService.login(user);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message || this.constant.error.auth.userNotFound };
    }
  }

  @Post('password/forgot')
  async forgotPassword(@Body('email') email: string) {
    try {
      const token = await this.usersService.generateResetPasswordToken(email);
      const body = `${this.constant.error.auth.findByIdError} ${token}`;
      console.log(typeof body);
      await this.emailService.sendEmailWithTemplate(email, body);

      return { success: true, message: this.constant.generalMessages.auth.resetTokenSent };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Put('password/reset')
  async resetPassword(
    @Body()
    body: {
    token: string;
    newPassword: string;
      confirmPassword: string;
    },
  ) {
    try {
      await this.usersService.resetPassword(
        body.token,
        body.newPassword,
        body.confirmPassword,
      );
      return { success: true, message: this.constant.generalMessages.auth.passwordReset };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('password/change')
  async changePassword(
    @Request() req,
    @Body()
    body: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    },
  ) {
    try {
      await this.usersService.changePassword(
        req.user.id,
        body.currentPassword,
        body.newPassword,
        body.confirmPassword,
      );
      return { success: true, message: this.constant.generalMessages.auth.passwordChanged };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Put('update/:id')
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Request() req,
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && userId !== id) {
      throw new ForbiddenException(this.constant.error.auth.updateProfileError);
    }
    // Admin-only: Update active status if present
    if (isAdmin && updateUserDto.isActive !== undefined) {
      await this.usersService.setUserActiveStatus(id, updateUserDto.isActive);
    }
    if (!isAdmin) {
      delete updateUserDto.isActive;
    }
    try {
      const updatedUser = await this.usersService.updateUser(id, updateUserDto);
      return { success: true, data: updatedUser };
    } catch (error) {
      throw new InternalServerErrorException(this.constant.error.auth.updateUserError);
    }
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh-token')
  async refreshToken(@Request() req): Promise<any> {
    try {
      const refreshToken = req.headers['authorization']?.split(' ')[1];
      if (!refreshToken) {
        throw new Error(this.constant.error.auth.refreshTokenError);
      }
      console.log(refreshToken);
      const newTokens = await this.authService.refreshToken(refreshToken);
      return {
        success: true,
        data: {
          accessToken: newTokens.accessToken,
          refreshToken: newTokens.refreshToken,
        },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  @Post('sms')
  async sendSMS(@Body() body: { phone: string; message: string }): Promise<any> {
    try {
      const { phone, message } = body;
      const response = await this.twilioService.sendSMSService(phone, message);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Post('call')
  async makeCall(@Body() body: { phone: string; message: string }): Promise<any> {
    try {
      const { phone, message } = body;
      const response = await this.twilioService.makeCallService(phone, message);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Get('check-phone/:number')
  async checkPhone(@Param('number') number: string): Promise<any> {
    try {
      const carrierInfo = await this.twilioService.checkPhoneService(number);
      return { success: true, data: carrierInfo };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  //   const newTokens = await this.authService.refreshToken(refreshToken);
  //   return { success: true, data: { accessToken: newTokens.accessToken, refreshToken: newTokens.refreshToken } };
  // } catch (error) {
  //   return { success: false, error: error.message };
}
