import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ForbiddenException,
  Request,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { PublicUser } from '@/database';
import { ParseIntPipe, ParseBooleanPipe, ParseArrayPipe } from '@/shared/pipes';
import { Messages } from '@/shared/decorators/messages.decorator';
import { MESSAGES } from '@/shared/constants';
import {
  ApiEnvelopeResponse,
  ApiErrorResponseDto,
} from '@/shared/dto/api-response.dto';
import { Roles } from '@/shared/decorators/roles.decorator';
import { Role } from '@/shared/enums';

type RequestUser = {
  id: string;
  email: string;
  roles: Role[];
};

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Create a user',
    description: 'Admin-only endpoint that creates a user account.',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiEnvelopeResponse({
    description: 'User created.',
    message: MESSAGES.CREATED,
    status: 201,
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'User payload validation failed.',
    type: ApiErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Bearer token is missing or invalid.',
    type: ApiErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Authenticated user does not have the admin role.',
    type: ApiErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'A user with the provided email already exists.',
    type: ApiErrorResponseDto,
  })
  @Messages(MESSAGES.CREATED)
  create(@Body() createUserDto: CreateUserDto): Promise<PublicUser> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'List users',
    description: 'Admin-only paginated user listing with optional filters.',
  })
  @ApiQuery({
    description: 'Page number starting at 1.',
    example: 1,
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    description: 'Maximum users to return. Values are capped at 100.',
    example: 20,
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiQuery({
    description: 'Filter by active or inactive status.',
    example: true,
    name: 'active',
    required: false,
    type: Boolean,
  })
  @ApiQuery({
    description: 'Comma-separated role filter.',
    enum: Role,
    example: Role.USER,
    name: 'roles',
    required: false,
  })
  @ApiEnvelopeResponse({
    description: 'Users matching the filters.',
    isArray: true,
    message: MESSAGES.DATA_FOUND,
    status: 200,
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'One of the filter query values is invalid.',
    type: ApiErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Bearer token is missing or invalid.',
    type: ApiErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Authenticated user does not have the admin role.',
    type: ApiErrorResponseDto,
  })
  @Messages(MESSAGES.DATA_FOUND)
  findAll(
    @Query('page', ParseIntPipe) page?: number,
    @Query('limit', ParseIntPipe) limit?: number,
    @Query('active', ParseBooleanPipe) active?: boolean,
    @Query('roles', ParseArrayPipe) roles?: string[],
  ): Promise<PublicUser[]> {
    return this.usersService.findAll({ page, limit, active, roles });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a user by id',
    description: 'Admins can read any user; users can read their own profile.',
  })
  @ApiParam({
    description: 'User UUID.',
    format: 'uuid',
    name: 'id',
  })
  @ApiEnvelopeResponse({
    description: 'Requested user.',
    message: MESSAGES.DATA_FOUND,
    status: 200,
    type: UserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Bearer token is missing or invalid.',
    type: ApiErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Authenticated user cannot access this user.',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User id was not found.',
    type: ApiErrorResponseDto,
  })
  @Messages(MESSAGES.DATA_FOUND)
  findOne(
    @Param('id') id: string,
    @Request() req: { user: RequestUser },
  ): Promise<PublicUser> {
    this.assertCanAccessUser(req.user, id);
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a user',
    description: 'Admins can update any user; users can update their profile.',
  })
  @ApiParam({
    description: 'User UUID.',
    format: 'uuid',
    name: 'id',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiEnvelopeResponse({
    description: 'Updated user.',
    message: MESSAGES.UPDATED,
    status: 200,
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Update payload validation failed.',
    type: ApiErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Bearer token is missing or invalid.',
    type: ApiErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Authenticated user cannot update this user.',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User id was not found.',
    type: ApiErrorResponseDto,
  })
  @Messages(MESSAGES.UPDATED)
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: { user: RequestUser },
  ): Promise<PublicUser> {
    this.assertCanAccessUser(req.user, id);
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Delete a user',
    description: 'Admin-only endpoint that removes a user account.',
  })
  @ApiParam({
    description: 'User UUID.',
    format: 'uuid',
    name: 'id',
  })
  @ApiEnvelopeResponse({
    description: 'User removed.',
    message: MESSAGES.DELETED,
    status: 200,
  })
  @ApiUnauthorizedResponse({
    description: 'Bearer token is missing or invalid.',
    type: ApiErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Authenticated user does not have the admin role.',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User id was not found.',
    type: ApiErrorResponseDto,
  })
  @Messages(MESSAGES.DELETED)
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }

  private assertCanAccessUser(user: RequestUser, userId: string) {
    if (user.id !== userId && !user.roles.includes(Role.ADMIN)) {
      throw new ForbiddenException(MESSAGES.USER_ACCESS_FORBIDDEN);
    }
  }
}
