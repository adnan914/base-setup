import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { and, arrayOverlaps, eq, isNull } from 'drizzle-orm';
import {
  authSessions,
  DatabaseService,
  isPostgresUniqueViolation,
  PublicUser,
  User,
  users,
} from '@/database';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role, SessionRevocationReason, Status } from '@/shared/enums';
import { MESSAGES } from '@/shared/constants';
import { normalizeEmail } from '@/shared/utils/email.util';

const USERS_EMAIL_CONSTRAINT = 'users_email_idx';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createUserDto: CreateUserDto): Promise<PublicUser> {
    const { password, roles = [Role.USER] } = createUserDto;
    const email = normalizeEmail(createUserDto.email);

    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException(MESSAGES.USER_EMAIL_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    try {
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
    } catch (error) {
      this.throwEmailConflict(error);
      throw error;
    }
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
      .where(eq(users.email, normalizeEmail(email)))
      .limit(1);

    return user ?? null;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<PublicUser> {
    const { password, ...updateData } = updateUserDto;

    const values: Partial<User> = {
      ...updateData,
      email: updateData.email ? normalizeEmail(updateData.email) : undefined,
      updatedAt: new Date(),
    };

    if (password) {
      values.password = await bcrypt.hash(password, 12);
    }

    try {
      if (password) {
        return await this.databaseService.db.transaction(async (tx) => {
          const [user] = await tx
            .update(users)
            .set(values)
            .where(eq(users.id, id))
            .returning();

          if (!user) {
            throw new NotFoundException(MESSAGES.USER_NOT_FOUND);
          }

          await tx
            .update(authSessions)
            .set({
              revokedAt: new Date(),
              revokedReason: SessionRevocationReason.PASSWORD_CHANGE,
              updatedAt: new Date(),
            })
            .where(
              and(eq(authSessions.userId, id), isNull(authSessions.revokedAt)),
            );

          return this.toPublicUser(user);
        });
      }

      const [user] = await this.databaseService.db
        .update(users)
        .set(values)
        .where(eq(users.id, id))
        .returning();

      if (!user) {
        throw new NotFoundException(MESSAGES.USER_NOT_FOUND);
      }

      return this.toPublicUser(user);
    } catch (error) {
      this.throwEmailConflict(error);
      throw error;
    }
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

  async revokeSessions(
    id: string,
    reason: SessionRevocationReason,
  ): Promise<void> {
    await this.databaseService.db
      .update(authSessions)
      .set({
        revokedAt: new Date(),
        revokedReason: reason,
        updatedAt: new Date(),
      })
      .where(and(eq(authSessions.userId, id), isNull(authSessions.revokedAt)));
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

  private throwEmailConflict(error: unknown): void {
    if (isPostgresUniqueViolation(error, USERS_EMAIL_CONSTRAINT)) {
      throw new ConflictException(MESSAGES.USER_EMAIL_EXISTS);
    }
  }
}
