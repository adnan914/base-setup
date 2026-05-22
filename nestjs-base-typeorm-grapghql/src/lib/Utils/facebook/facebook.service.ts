import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from '../../../module/users/users.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../../../module/users/dtos/CreateUser.dto';
import axios, { AxiosError } from 'axios';
import { faker } from '@faker-js/faker';
import { AuthService } from 'src/module/auth/auth.service';
import { ConstantConfig } from 'src/lib/constant/constant.config';

@Injectable()
export class FacebookService {
  constructor(private usersService: UsersService, private authService:AuthService,private constant: ConstantConfig) {}

  async saveFacebookUser(accessToken: string) {
    try {
      let userDetails = {};
      const facebookUserData = await this.getFacebookUserData(accessToken);
      if (!facebookUserData.email) {
        facebookUserData.email = faker.internet.email();
      }

      let user = await this.usersService.findUserByEmail(facebookUserData.email);   
      if (!user) {
        const userObject: CreateUserDto = {
          first_name: facebookUserData.name.split(' ')[0],
          last_name: facebookUserData.name.split(' ')[1],
          email: facebookUserData.email,
          password: Math.floor(1000 + Math.random() * 9000).toString(),
        };

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        userObject.password = await bcrypt.hash(userObject.password, salt);

        user = await this.usersService.createUser(userObject);
          userDetails={
          user:user,
          token:await this.authService.tokenGenerator(user.id)
        }    
        return userDetails;
      } else {
         userDetails={
          message:this.constant.generalMessages.auth.userLogin,
          token:await this.authService.tokenGenerator(user.id)
        }   
        return userDetails;
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; 
      }
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: this.constant.error.auth.facebook.failedToSave,
      };
    }
  }  
  private async getFacebookUserData(accessToken: string): Promise<any> {
    try {
      const response = await axios.get(`https://graph.facebook.com/v12.0/me?fields=id,name,email&access_token=${accessToken}`);
      return response.data;
    } catch (error) {   
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 400 && error.response.data.error && error.response.data.error.code === 190) {
          throw new HttpException(this.constant.error.auth.facebook.expiredAccessToken, HttpStatus.UNAUTHORIZED);
        }
      }   
      throw new HttpException(this.constant.error.auth.facebook.userDataError, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}  