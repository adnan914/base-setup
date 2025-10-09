import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FacebookAuthGuard extends AuthGuard('facebook') {
  constructor() {
    super({
      failureRedirect: '/auth/facebook/failed',
    });
  }
}
