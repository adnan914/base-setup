/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';
import { GoogleAuthService } from './google.service';

@Controller('auth')
export class GoogleController {
  constructor(private googleAuthService: GoogleAuthService) {}
  
  @Post('google')
  async googleAuth(@Body('id_token') idToken: string) {
      try {
          const user = await this.googleAuthService.authenticate(idToken);
          return { success: true, user };
      } catch (error) {
          return { success: false, error: error.message };
      }
  }
}
