// facebook.controller.ts
import { Controller, Get, UseGuards, Req, Post, Body } from '@nestjs/common';
import { FacebookService } from './facebook.service';

@Controller("auth")
export class FacebookController {
  constructor(
    private facebookservice: FacebookService,
  ) {}
  @Post('facebook/login')
  async facebookLogin(@Body('accessToken') accessToken: string) {
    const userDetails = await this.facebookservice.saveFacebookUser(accessToken);
    return userDetails
  }
}
