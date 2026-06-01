import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '@lib/core/database';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // By default, passport-local expects "username" and "password" fields
    super();
  }

  async validate(username: string, password: string): Promise<User | null> {
    return this.authService.validateUser(username, password);
  }
}
