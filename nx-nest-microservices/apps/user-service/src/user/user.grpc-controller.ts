import { Controller } from '@nestjs/common';
import {
  CreateUserRequest,
  DeleteUserRequest,
  GetUserByEmailRequest,
  GetUserRequest,
  GRPC_SERVICES,
  ListUsersRequest,
  UpdateUserRequest
} from '@ecommerce/contracts';
import { GrpcMethod } from '@nestjs/microservices';
import { Role, User } from '@prisma/client';
import { UserService } from './user.service';

@Controller()
export class UserGrpcController {
  constructor(private readonly service: UserService) {}

  @GrpcMethod(GRPC_SERVICES.user, 'CreateUser')
  async createUser(payload: CreateUserRequest) {
    return this.toResponse(await this.service.create({ ...payload, role: payload.role as Role | undefined }));
  }

  @GrpcMethod(GRPC_SERVICES.user, 'GetUser')
  async getUser(payload: GetUserRequest) {
    return this.toResponse(await this.service.get(payload.id));
  }

  @GrpcMethod(GRPC_SERVICES.user, 'GetUserByEmail')
  async getUserByEmail(payload: GetUserByEmailRequest) {
    return this.toResponse(await this.service.getByEmail(payload.email));
  }

  @GrpcMethod(GRPC_SERVICES.user, 'ListUsers')
  async listUsers(payload: ListUsersRequest) {
    const page = payload.page || 1;
    const limit = payload.limit || 20;
    const result = await this.service.list(page, limit);
    return { data: result.data.map((user) => this.toResponse(user)), page, limit, total: result.total };
  }

  @GrpcMethod(GRPC_SERVICES.user, 'UpdateUser')
  async updateUser(payload: UpdateUserRequest) {
    return this.toResponse(await this.service.update(payload.id, { ...payload, role: payload.role as Role | undefined }));
  }

  @GrpcMethod(GRPC_SERVICES.user, 'DeleteUser')
  deleteUser(payload: DeleteUserRequest) {
    return this.service.delete(payload.id);
  }

  private toResponse(user: User) {
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      role: user.role,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };
  }
}
