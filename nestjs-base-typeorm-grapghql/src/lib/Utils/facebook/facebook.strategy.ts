// auth.service.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: 'http://localhost:3020/auth/facebook/callback',
      scope: 'email',
      profileFields: ['emails', 'name']
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any): Promise<any> {  
    return profile;
  }
}
