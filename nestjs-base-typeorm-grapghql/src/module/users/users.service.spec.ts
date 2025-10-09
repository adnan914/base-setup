import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../typeorm/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dtos/CreateUser.dto';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserRepository = {
    find: jest.fn().mockResolvedValue(['user1', 'user2']),
    findOne: jest.fn().mockImplementation((options) => {
      if (options.where.email === 'existing@example.com') {
        return Promise.resolve({ email: 'existing@example.com', id: 1 });
      } else if (options.where.id && options.where.id !== 999) {
        return Promise.resolve({
          id: options.where.id,
          email: 'email@example.com',
        });
      }
      return null;
    }),
    save: jest
      .fn()
      .mockImplementation((user) =>
        Promise.resolve({ ...user, id: user.id || Date.now() }),
      ),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findUsers', () => {
    it('should return an array of users', async () => {
      expect(await service.findUsers()).toEqual(['user1', 'user2']);
    });
  });

  describe('findUserById', () => {
    it('should return a user if found', async () => {
      const email = 'existing@example.com';
      mockUserRepository.findOne.mockResolvedValueOnce({
        email: email,
        id: 1,
        password: 'hashedPassword',
      });
      await expect(service.findUserByEmail(email)).resolves.toEqual({
        email: email,
        id: 1,
        password: 'hashedPassword',
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 999;
      await expect(service.findUserById(userId)).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('findUserByEmail', () => {
    it('should return a user if found', async () => {
      const email = 'existing@example.com';
      await expect(service.findUserByEmail(email)).resolves.toEqual({
        email: email,
        password: 'hashedPassword',
      });
    });

    it('should return null if user not found', async () => {
      const email = 'nonexisting@example.com';
      await expect(service.findUserByEmail(email)).resolves.toBeNull();
    });
  });

  describe('createUser', () => {
    it('should successfully create a user with a hashed password', async () => {
      const createUserDto: CreateUserDto = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'newuser@example.com',
        password: '123456',
      };

      mockUserRepository.findOne.mockResolvedValueOnce(null);
      const createdUser = await service.createUser(createUserDto);

      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          first_name: 'John',
          last_name: 'Doe',
          email: 'newuser@example.com',
          password: 'hashedPassword',
        }),
      );
      expect(createdUser).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          first_name: 'John',
          last_name: 'Doe',
          email: 'newuser@example.com',
          password: 'hashedPassword',
        }),
      );
    });

    it('should not create a user if the email already exists', async () => {
      const createUserDto: CreateUserDto = {
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'existing@example.com',
        password: 'password',
      };

      mockUserRepository.findOne.mockResolvedValueOnce({
        email: 'existing@example.com',
      });
      await expect(service.createUser(createUserDto)).rejects.toThrow();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should handle errors during user creation', async () => {
      const createUserDto: CreateUserDto = {
        first_name: 'Test',
        last_name: 'User',
        email: 'testuser@example.com',
        password: 'password',
      };

      mockUserRepository.findOne.mockResolvedValueOnce(null);
      mockUserRepository.save.mockRejectedValueOnce(
        new Error('Database error'),
      );

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        'Database error',
      );

      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'testuser@example.com',
        }),
      );
    });
  });

  describe('validateUser', () => {
    mockUserRepository.findOne.mockImplementation((options) => {
      if (options.where.email === 'existing@example.com') {
        return Promise.resolve({
          email: 'existing@example.com',
          password: 'hashedPassword',
        });
      }
      return null;
    });

    it('should return a user if validation is successful', async () => {
      const email = 'existing@example.com';
      const password = 'password';
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      const result = await service.validateUser(email, password);
      expect(result).toEqual(expect.objectContaining({ email }));
    });

    it('should return null if user not found', async () => {
      const email = 'nonexisting@example.com';
      const password = 'password';
      const result = await service.validateUser(email, password);
      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      const email = 'existing@example.com';
      const password = 'wrongpassword';
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
      const result = await service.validateUser(email, password);
      expect(result).toBeNull();
    });
  });

  describe('generateResetPasswordToken', () => {
    it('should generate a reset token for an existing user', async () => {
      const email = 'existing@example.com';
      const mockUser = {
        email,
        id: 1,
        reset_password_token: null,
        reset_password_sent_at: null,
      };

      mockUserRepository.findOne.mockResolvedValueOnce(mockUser);

      const resetToken = await service.generateResetPasswordToken(email);

      expect(resetToken).toBeDefined();
      expect(typeof resetToken).toBe('string');
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          email: email,
          reset_password_token: expect.any(String),
          reset_password_sent_at: expect.any(Date),
        }),
      );
    });

    it('should throw an error if the user is not found', async () => {
      const email = 'nonexisting@example.com';
      mockUserRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.generateResetPasswordToken(email)).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('resetPassword', () => {
    it('should successfully reset the password', async () => {
      const token = 'valid-token';
      const newPassword = 'newPassword';
      const confirmPassword = 'newPassword';
      const mockUser = {
        id: 1,
        email: 'user@example.com',
        password: 'oldPassword',
        reset_password_token: token,
        reset_password_sent_at: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValueOnce(mockUser);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedNewPassword');

      await service.resetPassword(token, newPassword, confirmPassword);

      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          password: 'hashedNewPassword',
          reset_password_token: null,
          reset_password_sent_at: null,
        }),
      );
    });

    it('should throw an error if passwords do not match', async () => {
      const token = 'valid-token';
      const newPassword = 'newPassword';
      const confirmPassword = 'differentPassword';

      await expect(
        service.resetPassword(token, newPassword, confirmPassword),
      ).rejects.toThrow('Passwords do not match');
    });

    it('should throw an error if token is invalid', async () => {
      const token = 'invalid-token';
      const newPassword = 'newPassword';
      const confirmPassword = 'newPassword';

      mockUserRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.resetPassword(token, newPassword, confirmPassword),
      ).rejects.toThrow('Invalid token');
    });
  });

  describe('changePassword', () => {
    it('should successfully change the password', async () => {
      const userId = 1;
      const currentPassword = 'currentPassword';
      const newPassword = 'newPassword';
      const confirmPassword = 'newPassword';
      const mockUser = {
        id: userId,
        email: 'user@example.com',
        password: 'hashedCurrentPassword',
      };

      mockUserRepository.findOne.mockResolvedValueOnce(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedNewPassword');

      await service.changePassword(
        userId,
        currentPassword,
        newPassword,
        confirmPassword,
      );

      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          password: 'hashedNewPassword',
        }),
      );
    });

    it('should throw an error if current password is incorrect', async () => {
      const userId = 1;
      const currentPassword = 'wrongCurrentPassword';
      const newPassword = 'newPassword';
      const confirmPassword = 'newPassword';
      const mockUser = {
        id: userId,
        email: 'user@example.com',
        password: 'hashedCurrentPassword',
      };

      mockUserRepository.findOne.mockResolvedValueOnce(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false);

      await expect(
        service.changePassword(
          userId,
          currentPassword,
          newPassword,
          confirmPassword,
        ),
      ).rejects.toThrow('Current password is incorrect');
    });

    it('should throw an error if new password and confirm password do not match', async () => {
      const userId = 1;
      const currentPassword = 'currentPassword';
      const newPassword = 'newPassword';
      const confirmPassword = 'differentPassword';
      const mockUser = {
        id: userId,
        email: 'user@example.com',
        password: 'hashedCurrentPassword',
      };

      mockUserRepository.findOne.mockResolvedValueOnce(mockUser);

      await expect(
        service.changePassword(
          userId,
          currentPassword,
          newPassword,
          confirmPassword,
        ),
      ).rejects.toThrow('New password and confirm password do not match');
    });
  });

  describe('updateUser', () => {
    it('should successfully update a user', async () => {
      const userId = 1;
      const updateUserDto = {
        firstName: 'UpdatedName',
        email: 'updated@example.com',
      };
      const mockUser = {
        id: userId,
        email: 'user@example.com',
        firstName: 'Name',
      };

      mockUserRepository.findOne.mockResolvedValueOnce(mockUser);
      mockUserRepository.save.mockImplementation((user) =>
        Promise.resolve({ ...user }),
      );

      const result = await service.updateUser(userId, updateUserDto);

      expect(result).toEqual(
        expect.objectContaining({
          id: userId,
          ...updateUserDto,
        }),
      );
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateUserDto),
      );
    });
  });

  describe('setUserActiveStatus', () => {
    it('should set user active status', async () => {
      const userId = 1;
      const isActive = false;

      mockUserRepository.findOne.mockResolvedValueOnce({
        id: userId,
        isActive: true,
      });

      await service.setUserActiveStatus(userId, isActive);

      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: userId,
          isActive: isActive,
        }),
      );
    });
  });
});
