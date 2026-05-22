import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../typeorm/entities/user.entity';
import { CreateUserDto } from './dtos/CreateUser.dto';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dtos/UpdateUser.dto';
import { plainToClass } from 'class-transformer';
import { ConstantConfig } from 'src/lib/constant/constant.config';

@Injectable()
export class UsersService {
  findOrCreateWithFacebook(userToInsert: any) {
    throw new Error('Method not implemented.');
  }
  findOrCreate(profile: any) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private constant: ConstantConfig
  ) {}

  async findUsers() {
    return this.userRepository.find();
  }

  async findUserById(id: number) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException(this.constant.error.auth.userNotFound);
      }
      return user;
    } catch (error) {
      throw new Error(this.constant.error.auth.findByIdError + error.message);
    }
  }

  //Graphql uses
  async findAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findUserByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async createUser(createUserDto: CreateUserDto) {
    const user = plainToClass(User, createUserDto);
    if (createUserDto.password) {
      user.password = await this.hashPassword(createUserDto.password);
    }
    return this.userRepository.save(user);
  }

  async hashPassword(password: string) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      return null;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    return isPasswordValid ? user : null;
  }

  async generateResetPasswordToken(email: string): Promise<string> {
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new Error(this.constant.error.auth.userNotFound);
    }
    const resetToken = uuidv4();
    user.reset_password_token = resetToken;
    user.reset_password_sent_at = new Date();
    await this.userRepository.save(user);
    return resetToken;
  }

  async resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<void> {
    if (newPassword !== confirmPassword) {
      throw new Error(this.constant.error.auth.passwordMismatch);
    }
    const user = await this.userRepository.findOne({
      where: { reset_password_token: token },
    });
    if (!user) {
      throw new Error(this.constant.error.auth.invalidToken);
    }
    user.password = await this.hashPassword(newPassword);
    user.reset_password_token = null; 
    user.reset_password_sent_at = null;
    await this.userRepository.save(user);
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<void> {
    if (newPassword !== confirmPassword) {
      throw new Error(this.constant.error.auth.passwordMismatchNew);
    }
    const user = await this.findUserById(userId);
    if (!user) {
      throw new Error(this.constant.error.auth.userNotFound);
    }
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new Error(this.constant.error.auth.incorrectCurrentPassword);
    }
    user.password = await this.hashPassword(newPassword);
    await this.userRepository.save(user);
  }

  async updateUser(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error(this.constant.error.auth.userNotFound);
    }
    // Mapping updated fields
    Object.assign(user, updateUserDto);
    if (updateUserDto.password) {
      user.password = await this.hashPassword(updateUserDto.password);
    }
    return this.userRepository.save(user);
  }
  async setUserActiveStatus(userId: number, isActive: boolean): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error(this.constant.error.auth.userNotFound);
    }
    user.isActive = isActive;
    await this.userRepository.save(user);
  }

  async updateUserCustId(userId: number, custId: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      user.cust_id = custId;
      return this.userRepository.save(user);
    }
    return undefined;
  }

  async getUserIDByCustomerId(customerId: string): Promise<number | null> {
  try {
    const user = await this.userRepository.findOne({ where: { cust_id: customerId } });
    return user ? user.id : null;
  } catch (error) {
    console.error(this.constant.error.auth.customerIdError + error.message);
    return null;
  }
}

async updateUserCustCardId(userId: number, custCardId: string): Promise<User | undefined> {
  const user = await this.userRepository.findOne({ where: { id: userId } });
  if (user) {
    user.cust_card_id = custCardId;
    return this.userRepository.save(user);
  }
  return undefined;
}
}
