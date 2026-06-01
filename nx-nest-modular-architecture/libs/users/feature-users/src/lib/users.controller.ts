import {
  Controller,
  Get,
  Body,
  Post,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { Request } from "express";
import { UsersService } from "./users.service";
// import { CreateUserDto } from './dto/create-user.dto';
import {
  AdminListQueryDto,
  CreateAdminDto,
  UpdateAdminDto,
} from "./dto/admin-management.dto";
import { AuditLogListQueryDto } from "./dto/audit-log.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { JwtAuthGuard } from "@lib/core/common";
import { RolesGuard } from "@lib/core/common";
import { User } from "@lib/core/database";
import {
  RES_MESSAGES,
  Messages,
  ParseIntPipe,
  ParseBooleanPipe,
  ParseArrayPipe,
  extractAuditActor,
  Roles,
  UserRole,
  SWAGGER_MESSAGES,
} from "@lib/core/common";

type AuthenticatedRequest = Request & {
  user?: {
    id?: string;
    email?: string;
    role?: string;
  };
};

@ApiTags("users")
@Controller("users")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("admins/options")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.PLATFORM_ADMIN, UserRole.SUPPORT_ADMIN)
  @ApiOperation({ summary: SWAGGER_MESSAGES.USER_GET_ADMIN_OPTIONS })
  @ApiOkResponse({ description: RES_MESSAGES.DATA_FOUND })
  @Messages(RES_MESSAGES.DATA_FOUND)
  getAdminOptions(@Req() req: AuthenticatedRequest) {
    return this.usersService.getAdminOptions(extractAuditActor(req));
  }

  @Get("admins")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.PLATFORM_ADMIN, UserRole.SUPPORT_ADMIN)
  @ApiOperation({ summary: SWAGGER_MESSAGES.USER_LIST_ADMINS })
  @ApiOkResponse({ description: RES_MESSAGES.DATA_FOUND })
  @Messages(RES_MESSAGES.DATA_FOUND)
  listAdmins(@Query() query: AdminListQueryDto, @Req() req: AuthenticatedRequest) {
    return this.usersService.listAdmins(query, extractAuditActor(req));
  }

  @Get("audit-logs")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.PLATFORM_ADMIN, UserRole.SUPPORT_ADMIN)
  @ApiOperation({ summary: SWAGGER_MESSAGES.USER_LIST_AUDIT_LOGS })
  @ApiOkResponse({ description: RES_MESSAGES.DATA_FOUND })
  @Messages(RES_MESSAGES.DATA_FOUND)
  listAuditLogs(@Query() query: AuditLogListQueryDto) {
    return this.usersService.listAuditLogs(query);
  }

  @Get("audit-logs/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.PLATFORM_ADMIN, UserRole.SUPPORT_ADMIN)
  @ApiOperation({ summary: SWAGGER_MESSAGES.USER_GET_AUDIT_LOG })
  @ApiParam({ name: "id", type: String })
  @ApiOkResponse({ description: RES_MESSAGES.DATA_FOUND })
  @Messages(RES_MESSAGES.DATA_FOUND)
  getAuditLog(@Param("id") id: string) {
    return this.usersService.getAuditLogById(id);
  }

  @Get("admins/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.PLATFORM_ADMIN, UserRole.SUPPORT_ADMIN)
  @ApiOperation({ summary: SWAGGER_MESSAGES.USER_GET_ADMIN })
  @ApiParam({ name: "id", type: String })
  @ApiOkResponse({ description: RES_MESSAGES.DATA_FOUND })
  @Messages(RES_MESSAGES.DATA_FOUND)
  findAdmin(@Param("id") id: string, @Req() req: AuthenticatedRequest) {
    return this.usersService.findAdminById(id, extractAuditActor(req));
  }

  @Post("admins")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.PLATFORM_ADMIN, UserRole.SUPPORT_ADMIN)
  @ApiOperation({ summary: SWAGGER_MESSAGES.USER_CREATE_ADMIN })
  @ApiOkResponse({ description: RES_MESSAGES.CREATED })
  @Messages(RES_MESSAGES.CREATED)
  createAdmin(@Body() dto: CreateAdminDto, @Req() req: AuthenticatedRequest) {
    return this.usersService.createAdmin(dto, extractAuditActor(req));
  }

  @Patch("admins/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.PLATFORM_ADMIN, UserRole.SUPPORT_ADMIN)
  @ApiOperation({ summary: SWAGGER_MESSAGES.USER_UPDATE_ADMIN })
  @ApiParam({ name: "id", type: String })
  @ApiOkResponse({ description: RES_MESSAGES.UPDATED })
  @Messages(RES_MESSAGES.UPDATED)
  updateAdmin(@Param("id") id: string, @Body() dto: UpdateAdminDto, @Req() req: AuthenticatedRequest) {
    return this.usersService.updateAdmin(id, dto, extractAuditActor(req));
  }

  @Delete("admins/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.PLATFORM_ADMIN, UserRole.SUPPORT_ADMIN)
  @ApiOperation({ summary: SWAGGER_MESSAGES.USER_DELETE_ADMIN })
  @ApiParam({ name: "id", type: String })
  @ApiOkResponse({ description: RES_MESSAGES.DELETED })
  @Messages(RES_MESSAGES.DELETED)
  removeAdmin(@Param("id") id: string, @Req() req: AuthenticatedRequest) {
    return this.usersService.removeAdmin(id, extractAuditActor(req));
  }

  // @Post()
  // @Messages(RES_MESSAGES.CREATED)
  // create(@Body() createUserDto: CreateUserDto): Promise<User> {
  //   return this.usersService.create(createUserDto);
  // }

  @Get()
  @ApiOperation({ summary: SWAGGER_MESSAGES.USER_LIST_USERS })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'active', required: false, type: Boolean })
  @ApiQuery({ name: 'roles', required: false, type: [String] })
  @ApiOkResponse({ description: RES_MESSAGES.DATA_FOUND })
  @Messages(RES_MESSAGES.DATA_FOUND)
  findAll(
    @Query("page", ParseIntPipe) _page?: number,
    @Query("limit", ParseIntPipe) _limit?: number,
    @Query("active", ParseBooleanPipe) _active?: boolean,
    @Query("roles", ParseArrayPipe) _roles?: string[],
  ): Promise<User[]> {
    void [_page, _limit, _active, _roles];
    return this.usersService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: SWAGGER_MESSAGES.USER_GET_BY_ID })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ description: RES_MESSAGES.DATA_FOUND })
  @Messages(RES_MESSAGES.DATA_FOUND)
  findOne(@Param("id") id: string): Promise<User> {
    return this.usersService.findById(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: SWAGGER_MESSAGES.USER_UPDATE })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ description: RES_MESSAGES.UPDATED })
  @Messages(RES_MESSAGES.UPDATED)
  update(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: SWAGGER_MESSAGES.USER_DELETE })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ description: RES_MESSAGES.DELETED })
  @Messages(RES_MESSAGES.DELETED)
  remove(@Param("id") id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}
