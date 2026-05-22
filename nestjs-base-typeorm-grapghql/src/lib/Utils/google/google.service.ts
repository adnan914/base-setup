import { Injectable } from '@nestjs/common';
import { UsersService } from '../../../module/users/users.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../../../module/users/dtos/CreateUser.dto';
import { GoogleStrategy } from './google-strategy';
import { ConstantConfig } from 'src/lib/constant/constant.config';
import { AuthService } from 'src/module/auth/auth.service';
@Injectable()
export class GoogleAuthService {
    constructor(private usersService: UsersService,
        private googleStrategy: GoogleStrategy,
        private constant: ConstantConfig,
        private authService:AuthService) {}

    async authenticate(idToken: string) {
        try {
            let userDetails ={}; 
            const payload = await this.googleStrategy.validateIdToken(idToken);
            if (!payload || !payload.email) {
                throw new Error(this.constant.error.auth.google.emailNotFound);
            }

            let user = await this.usersService.findUserByEmail(payload.email);
            if (!user) {
                const userObject: CreateUserDto = {
                    first_name: payload.given_name.split(' ')[0] || payload.email.split('@')[0],
                    last_name: payload.given_name.split(' ')[1] || 'DefaultLastName',
                    email: payload.email,
                    password: Math.floor(1000 + Math.random() * 9000).toString(),
                };

                const saltRounds = 10;
                const salt = await bcrypt.genSalt(saltRounds);
                userObject.password = await bcrypt.hash(userObject.password, salt);

                user = await this.usersService.createUser(userObject);
               return userDetails={
                 message: this.constant.generalMessages.auth.userCreated,
                    user:user,
                    token:await this.authService.tokenGenerator(user.id)
                  } 
            } else {
             return userDetails={
                    message: this.constant.generalMessages.auth.userLogin,
                    token:await this.authService.tokenGenerator(user.id)
                  }
            }
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
