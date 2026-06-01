import { callWithCircuitBreaker, JwtAuthGuard, Roles, RolesGuard } from '@ecommerce/common';
import { AuthGrpcClient, GRPC_SERVICES, ListUsersResponse, PublicUserResponse, UserGrpcClient, UserResponse } from '@ecommerce/contracts';
import { CreateUserDto, PaginationDto, RoleDto, UpdateUserDto } from '@ecommerce/dto';
import { Body, Controller, Delete, Get, Inject, OnModuleInit, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController implements OnModuleInit {
  private users!: UserGrpcClient;
  private auth!: AuthGrpcClient;

  constructor(
    @Inject('USER_PACKAGE') private readonly userClient: ClientGrpc,
    @Inject('AUTH_PACKAGE') private readonly authClient: ClientGrpc
  ) {}

  onModuleInit() {
    this.users = this.userClient.getService<UserGrpcClient>(GRPC_SERVICES.user);
    this.auth = this.authClient.getService<AuthGrpcClient>(GRPC_SERVICES.auth);
  }

  @Post()
  @Roles(RoleDto.ADMIN)
  create(@Body() dto: CreateUserDto) {
    return callWithCircuitBreaker(() => this.auth.register(dto));
  }

  @Get()
  @Roles(RoleDto.ADMIN, RoleDto.SUPPORT)
  async list(@Query() query: PaginationDto) {
    const result = await callWithCircuitBreaker<ListUsersResponse>(() => this.users.listUsers({ page: query.page, limit: query.limit }));
    return { ...result, data: result.data.map((user) => this.toPublicUser(user)) };
  }

  @Get(':id')
  @Roles(RoleDto.ADMIN, RoleDto.SUPPORT)
  async get(@Param('id') id: string) {
    return this.toPublicUser(await callWithCircuitBreaker(() => this.users.getUser({ id })));
  }

  @Patch(':id')
  @Roles(RoleDto.ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.toPublicUser(await callWithCircuitBreaker(() => this.users.updateUser({ id, ...dto })));
  }

  @Delete(':id')
  @Roles(RoleDto.ADMIN)
  delete(@Param('id') id: string) {
    return callWithCircuitBreaker(() => this.users.deleteUser({ id }));
  }

  private toPublicUser(user: UserResponse): PublicUserResponse {
    const { passwordHash: _passwordHash, ...publicUser } = user;
    return publicUser;
  }
}
