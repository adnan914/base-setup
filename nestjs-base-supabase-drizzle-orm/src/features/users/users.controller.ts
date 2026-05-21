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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
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
  create(@Body() createUserDto: CreateUserDto): Promise<PublicUser> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(Role.ADMIN)
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
  @Messages(MESSAGES.DATA_FOUND)
  findOne(
    @Param('id') id: string,
    @Request() req: { user: RequestUser },
  ): Promise<PublicUser> {
    this.assertCanAccessUser(req.user, id);
    return this.usersService.findById(id);
  }

  @Patch(':id')
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
  @Messages(MESSAGES.DELETED)
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }

  private assertCanAccessUser(user: RequestUser, userId: string) {
    if (user.id !== userId && !user.roles.includes(Role.ADMIN)) {
      throw new ForbiddenException('You cannot access this user');
    }
  }
}
