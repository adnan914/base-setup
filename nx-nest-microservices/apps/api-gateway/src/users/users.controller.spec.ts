import { UsersController } from './users.controller';

describe('UsersController', () => {
  it('removes passwordHash from public user responses', () => {
    const controller = new UsersController({} as any, {} as any);
    const result = (controller as any).toPublicUser({
      id: '1',
      email: 'admin@example.com',
      passwordHash: 'secret',
      role: 'ADMIN',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    expect(result.passwordHash).toBeUndefined();
    expect(result.email).toBe('admin@example.com');
  });
});
