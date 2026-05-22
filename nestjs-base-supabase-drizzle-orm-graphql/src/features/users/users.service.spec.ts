import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { DatabaseService } from '@/database';
import { Role, SessionRevocationReason, Status } from '@/shared/enums';
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

  it('revokes sessions in the password update transaction', async () => {
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
    const transaction = {
      update: jest
        .fn()
        .mockReturnValueOnce(userUpdate)
        .mockReturnValueOnce(sessionUpdate),
    };
    const databaseService = {
      db: {
        transaction: jest.fn(
          async (callback: (tx: typeof transaction) => Promise<unknown>) =>
            callback(transaction),
        ),
      },
    } as unknown as DatabaseService;
    const usersService = new UsersService(databaseService);

    await usersService.update(user.id, {
      password: 'Use-A-Long-Password-123',
    });

    expect(databaseService.db.transaction).toHaveBeenCalled();
    expect(sessionUpdate.set).toHaveBeenCalledWith(
      expect.objectContaining({
        revokedReason: SessionRevocationReason.PASSWORD_CHANGE,
      }),
    );
  });

  it('maps database email uniqueness failures to conflicts', async () => {
    const insert = {
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockRejectedValue({
        code: '23505',
        constraint: 'users_email_idx',
      }),
    };
    const databaseService = {
      db: {
        insert: jest.fn().mockReturnValue(insert),
      },
    } as unknown as DatabaseService;
    const usersService = new UsersService(databaseService);
    jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

    await expect(
      usersService.create({
        email: ' DUPLICATE@EXAMPLE.COM ',
        firstName: 'Duplicate',
        lastName: 'User',
        password: 'Use-A-Long-Password-123',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(insert.values).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'duplicate@example.com' }),
    );
  });
});
