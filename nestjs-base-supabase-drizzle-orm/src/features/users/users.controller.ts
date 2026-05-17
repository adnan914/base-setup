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

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @Messages(MESSAGES.CREATED)
  create(@Body() createUserDto: CreateUserDto): Promise<PublicUser> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Messages(MESSAGES.DATA_FOUND)
  findAll(
    @Query('page', ParseIntPipe) page?: number,
    @Query('limit', ParseIntPipe) limit?: number,
    @Query('active', ParseBooleanPipe) active?: boolean,
    @Query('roles', ParseArrayPipe) roles?: string[],
  ): Promise<PublicUser[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Messages(MESSAGES.DATA_FOUND)
  findOne(@Param('id') id: string): Promise<PublicUser> {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @Messages(MESSAGES.UPDATED)
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<PublicUser> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Messages(MESSAGES.DELETED) 
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}
