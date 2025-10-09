import { Test, TestingModule } from '@nestjs/testing';
import { UserResolver } from './users.resolver';
import { UsersService } from './users.service';

describe('UserResolver', () => {
  let resolver: UserResolver;
  let usersService: UsersService;

  // Mock UsersService
  const mockUsersService = {
    findAllUsers: jest.fn(() => Promise.resolve([])),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should return an array of users', async () => {
    const result = await resolver.users();

    expect(usersService.findAllUsers).toHaveBeenCalled();

    expect(result).toEqual([]);
  });
});
