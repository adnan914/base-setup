// /* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ConstantConfig } from 'src/lib/constant/constant.config';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private constant: ConstantConfig
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.userService.validateUser(email, password);
      if (user) {
        return user;
      }
      return null;
    } catch (error) {
      throw new Error(this.constant.error.auth.userNotFound);
    }
  }



  async tokenGenerator(payload: any) {
    const accessTokenPayload = { ...payload, tokenType: 'accessToken' };
    const refreshTokenPayload = { ...payload, tokenType: 'refreshToken' };

    return {
      accessToken: this.jwtService.sign(accessTokenPayload, {
        expiresIn: '60m',
      }),
      refreshToken: this.jwtService.sign(refreshTokenPayload, {
        expiresIn: '7d',
      }),
    };
    
  }

  async login(user: any) {
    try {
      const payload = { sub: user.id };
      const tokens = await this.tokenGenerator(payload);
      return tokens;
    } catch (error) {
      throw new Error(error.message);
    }
  }

 
  
  async validateRefreshToken(token: string): Promise<any> {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET_KEY,
      });
      if (decoded.tokenType !== 'refreshToken') {
        throw new Error(this.constant.error.auth.invalidRefreshToken);
      }
      return decoded;
    } catch (error) {
      throw new Error(this.constant.error.auth.expiredRefreshToken);
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = await this.validateRefreshToken(refreshToken);
      const user = await this.userService.findUserById(decoded.sub);

      if (!user) {
        throw new Error('User not found');
      }

      const payload = { sub: user.id };
      return this.tokenGenerator(payload);
    } catch (error) {
      throw new Error(this.constant.error.auth.invalidRefreshToken);
    }
  }
}
