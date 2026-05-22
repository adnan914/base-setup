import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { ConstantConfig } from 'src/lib/constant/constant.config';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UsersService ,
              private constant: ConstantConfig
    ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET_KEY 
    });
  }
  async validate(payload: any) {
    try {
      if (payload.tokenType !== 'accessToken') {
        throw new UnauthorizedException(this.constant.error.auth.invalidTokenType);
      }
      const user = await this.userService.findUserById(payload.sub);
      if (!user) {
        throw new UnauthorizedException(this.constant.error.auth.userNotFound);
      }
      return user;
    } catch (error) {
      throw new UnauthorizedException(this.constant.error.auth.invalidToken, error.message);
    }
  }
}
