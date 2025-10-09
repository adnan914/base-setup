/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    validateUser: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mockedJwtToken'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUser', () => {
    it('should validate and return a user', async () => {
      const user = { id: 1, name: 'Pulkit', password: 'changeme' };
      mockUsersService.validateUser.mockResolvedValue(user);
      const result = await authService.validateUser('pulkit', 'changeme');
      expect(result).toEqual(user);
      expect(mockUsersService.validateUser).toHaveBeenCalledWith(
        'pulkit',
        'changeme',
      );
    });

    it('should return null for invalid credentials', async () => {
      mockUsersService.validateUser.mockResolvedValue(null);
      const result = await authService.validateUser('pulkit', 'wrongPassword');
      expect(result).toBeNull();
      expect(mockUsersService.validateUser).toHaveBeenCalledWith(
        'pulkit',
        'wrongPassword',
      );
    });
  });

  describe('login', () => {
    it('should return a JWT token for a valid user', async () => {
      const user = { id: 1, name: 'Pulkit' };
      const jwtPayload = { sub: user.id };
      const expectedToken = 'mockedJwtToken';
      mockJwtService.sign.mockReturnValue(expectedToken);
      const result = await authService.login(user);
      expect(result).toEqual({ accessToken: expectedToken });
      expect(mockJwtService.sign).toHaveBeenCalledWith(jwtPayload);
    });
  });
});
