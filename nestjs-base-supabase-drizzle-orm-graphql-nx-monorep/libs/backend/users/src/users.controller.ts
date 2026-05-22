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
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { PublicUser } from '@/database';
import { ParseIntPipe, ParseBooleanPipe, ParseArrayPipe } from '@/shared/pipes';
import { Messages } from '@/shared/decorators/messages.decorator';
import { MESSAGES } from '@/shared/constants';
import { Roles } from '@/shared/decorators/roles.decorator';
import { Role } from '@/shared/enums';
import { ApiErrorResponseDto } from '@/shared/dto/api-response.dto';
import {
  ApiEnvelopeMessageResponse,
  ApiEnvelopeResponse,
} from '@/shared/decorators/api-envelope-response.decorator';
import { UserResponseDto } from './dto/user-response.dto';

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
  @Messages(MESSAGES.CREATED)
  @ApiOperation({
    summary: 'Create user',
    description: 'Creates a user account. Only admins can assign user roles.',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiEnvelopeResponse({
    status: 201,
    description: 'User created.',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'User payload validation failed.',
    type: ApiErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Access token is missing, invalid, expired, or revoked.',
    type: ApiErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Authenticated user is not an admin.',
    type: ApiErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'A user with the provided email already exists.',
    type: ApiErrorResponseDto,
  })
  create(@Body() createUserDto: CreateUserDto): Promise<PublicUser> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(Role.ADMIN)
  @Messages(MESSAGES.DATA_FOUND)
  @ApiOperation({
    summary: 'List users',
    description:
      'Returns a paginated user list with optional status and role filtering for admins.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number starting at 1.',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum users per page. The service caps the value at 100.',
    example: 20,
  })
  @ApiQuery({
    name: 'active',
    required: false,
    type: Boolean,
    description: 'Filter active or inactive users.',
    example: true,
  })
  @ApiQuery({
    name: 'roles',
    required: false,
    type: String,
    description: 'Single role or comma-separated roles.',
    example: Role.USER,
  })
  @ApiEnvelopeResponse({
    status: 200,
    description: 'Users returned.',
    type: UserResponseDto,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: 'One of the list query filters is invalid.',
    type: ApiErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Access token is missing, invalid, expired, or revoked.',
    type: ApiErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Authenticated user is not an admin.',
    type: ApiErrorResponseDto,
  })
  findAll(
    @Query('page', ParseIntPipe) page?: number,
    @Query('limit', ParseIntPipe) limit?: number,
    @Query('active', ParseBooleanPipe) active?: boolean,
    @Query('roles', ParseArrayPipe) roles?: string[],
  ): Promise<PublicUser[]> {
    return this.usersService.findAll({ page, limit, active, roles });
  }

  @Get(':id')
  @Messages(MESSAGES.DATA_FOUND)
  @ApiOperation({
    summary: 'Get user by id',
    description: 'Returns the requested user for that user or an admin.',
  })
  @ApiParam({
    name: 'id',
    description: 'User id.',
    example: '5443be70-a277-4af6-a678-7b1787d19496',
  })
  @ApiEnvelopeResponse({
    status: 200,
    description: 'User returned.',
    type: UserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Access token is missing, invalid, expired, or revoked.',
    type: ApiErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Authenticated user cannot access this user.',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User was not found.',
    type: ApiErrorResponseDto,
  })
  findOne(
    @Param('id') id: string,
    @Request() req: { user: RequestUser },
  ): Promise<PublicUser> {
    this.assertCanAccessUser(req.user, id);
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @Messages(MESSAGES.UPDATED)
  @ApiOperation({
    summary: 'Update user',
    description:
      'Updates user profile fields for that user or an admin. Role changes are not accepted here.',
  })
  @ApiParam({
    name: 'id',
    description: 'User id.',
    example: '5443be70-a277-4af6-a678-7b1787d19496',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiEnvelopeResponse({
    status: 200,
    description: 'User updated.',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Update payload validation failed.',
    type: ApiErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Access token is missing, invalid, expired, or revoked.',
    type: ApiErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Authenticated user cannot update this user.',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User was not found.',
    type: ApiErrorResponseDto,
  })
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
  @Messages(MESSAGES.DELETED)
  @ApiOperation({
    summary: 'Delete user',
    description: 'Deletes a user account. Only admins can call this endpoint.',
  })
  @ApiParam({
    name: 'id',
    description: 'User id.',
    example: '5443be70-a277-4af6-a678-7b1787d19496',
  })
  @ApiEnvelopeMessageResponse(200, 'User deleted.')
  @ApiUnauthorizedResponse({
    description: 'Access token is missing, invalid, expired, or revoked.',
    type: ApiErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Authenticated user is not an admin.',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User was not found.',
    type: ApiErrorResponseDto,
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }

  private assertCanAccessUser(user: RequestUser, userId: string) {
    if (user.id !== userId && !user.roles.includes(Role.ADMIN)) {
      throw new ForbiddenException(MESSAGES.USER_ACCESS_FORBIDDEN);
    }
  }
}
