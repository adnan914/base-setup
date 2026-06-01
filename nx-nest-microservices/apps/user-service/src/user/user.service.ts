import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { UserRepository } from './user.repository';

interface CreateUserInput {
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  role?: Role;
}

@Injectable()
export class UserService {
  constructor(private readonly users: UserRepository) {}

  async create(input: CreateUserInput) {
    return this.users.create({
      email: input.email.toLowerCase(),
      passwordHash: input.passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role ?? Role.CUSTOMER
    });
  }

  async get(id: string) {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getByEmail(email: string) {
    const user = await this.users.findByEmail(email.toLowerCase());
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async list(page = 1, limit = 20) {
    return this.users.list(page, limit);
  }

  async update(id: string, input: { firstName?: string; lastName?: string; role?: Role }) {
    await this.get(id);
    return this.users.update(id, input);
  }

  async delete(id: string) {
    await this.get(id);
    await this.users.delete(id);
    return { deleted: true };
  }
}
