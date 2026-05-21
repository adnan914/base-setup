import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '@/database';
import { Role, Status } from '@/shared/enums';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: DatabaseService,
          useValue: {
            db: {},
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('revokes sessions after a password change', async () => {
    const user = {
      id: '67e55044-10b1-426f-9247-bb680e5fe0c8',
      email: 'user@example.com',
      firstName: 'Base',
      lastName: 'User',
      password: 'old-password-hash',
      roles: [Role.USER],
      status: Status.ACTIVE,
      profileImg: null,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const userUpdate = {
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([user]),
    };
    const sessionUpdate = {
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockResolvedValue(undefined),
    };
    const databaseService = {
      db: {
        update: jest
          .fn()
          .mockReturnValueOnce(userUpdate)
          .mockReturnValueOnce(sessionUpdate),
      },
    } as unknown as DatabaseService;
    const usersService = new UsersService(databaseService);

    await usersService.update(user.id, {
      password: 'Use-A-Long-Password-123',
    });

    expect(sessionUpdate.set).toHaveBeenCalledWith(
      expect.objectContaining({ revokedReason: 'password-change' }),
    );
  });
});
