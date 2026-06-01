import { NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';

describe('UserService', () => {
  const repository = {
    create: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    list: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  };

  beforeEach(() => jest.resetAllMocks());

  it('normalizes email when creating users', async () => {
    repository.create.mockResolvedValue({ id: '1', email: 'test@example.com' });
    await new UserService(repository as any).create({
      email: 'TEST@EXAMPLE.COM',
      passwordHash: 'hash'
    });
    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ email: 'test@example.com' }));
  });

  it('throws when user is missing', async () => {
    repository.findById.mockResolvedValue(null);
    await expect(new UserService(repository as any).get('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
