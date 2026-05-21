import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { and, arrayOverlaps, eq } from 'drizzle-orm';
import {
  authSessions,
  DatabaseService,
  PublicUser,
  User,
  users,
} from '@/database';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MESSAGES } from '@/shared/constants';
import { Role, Status } from '@/shared/enums';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createUserDto: CreateUserDto): Promise<PublicUser> {
    const { email, password, roles = [Role.USER] } = createUserDto;

    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException(MESSAGES.USER_ALREADY_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [user] = await this.databaseService.db
      .insert(users)
      .values({
        email,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        password: hashedPassword,
        roles,
        status: Status.ACTIVE,
      })
      .returning();

    return this.toPublicUser(user);
  }

  async findAll(options?: {
    page?: number;
    limit?: number;
    active?: boolean;
    roles?: string[];
  }): Promise<PublicUser[]> {
    const page = Math.max(options?.page ?? 1, 1);
    const limit = Math.min(Math.max(options?.limit ?? 20, 1), 100);
    const filters = [];

    if (options?.active !== undefined) {
      filters.push(
        eq(users.status, options.active ? Status.ACTIVE : Status.INACTIVE),
      );
    }

    if (options?.roles?.length) {
      filters.push(arrayOverlaps(users.roles, options.roles as Role[]));
    }

    const allUsers = await this.databaseService.db
      .select()
      .from(users)
      .where(filters.length ? and(...filters) : undefined)
      .limit(limit)
      .offset((page - 1) * limit);

    return allUsers.map((user) => this.toPublicUser(user));
  }

  async findById(id: string): Promise<PublicUser> {
    const [user] = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      throw new NotFoundException(MESSAGES.USER_NOT_FOUND);
    }

    return this.toPublicUser(user);
  }

  async findAuthById(id: string): Promise<User> {
    const [user] = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      throw new NotFoundException(MESSAGES.USER_NOT_FOUND);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user ?? null;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<PublicUser> {
    const { password, ...updateData } = updateUserDto;

    const values: Partial<User> = {
      ...updateData,
      updatedAt: new Date(),
    };

    if (password) {
      values.password = await bcrypt.hash(password, 12);
    }

    const [user] = await this.databaseService.db
      .update(users)
      .set(values)
      .where(eq(users.id, id))
      .returning();

    if (!user) {
      throw new NotFoundException(MESSAGES.USER_NOT_FOUND);
    }

    if (password) {
      await this.revokeSessions(id, 'password-change');
    }

    return this.toPublicUser(user);
  }

  async remove(id: string): Promise<void> {
    const [deletedUser] = await this.databaseService.db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });

    if (!deletedUser) {
      throw new NotFoundException(MESSAGES.USER_NOT_FOUND);
    }
  }

  async revokeSessions(id: string, reason: string): Promise<void> {
    await this.databaseService.db
      .update(authSessions)
      .set({
        revokedAt: new Date(),
        revokedReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(authSessions.userId, id));
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.databaseService.db
      .update(users)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  private toPublicUser(user: User): PublicUser {
    const { password: _password, ...publicUser } = user;
    return publicUser;
  }
}
