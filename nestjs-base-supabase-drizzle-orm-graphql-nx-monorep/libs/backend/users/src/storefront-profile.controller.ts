import { Body, Controller, Get, Patch, Request } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PublicUser } from '@/database';
import { ApiEnvelopeResponse } from '@/shared/decorators/api-envelope-response.decorator';
import { Messages } from '@/shared/decorators/messages.decorator';
import { MESSAGES } from '@/shared/constants';
import { ApiErrorResponseDto } from '@/shared/dto/api-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

type CustomerRequest = {
  user: {
    id: string;
  };
};

@ApiTags('profile')
@ApiBearerAuth()
@Controller('profile')
export class StorefrontProfileController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Messages(MESSAGES.DATA_FOUND)
  @ApiOperation({ summary: 'Get the current customer profile' })
  @ApiEnvelopeResponse({
    status: 200,
    description: 'Current customer profile returned.',
    type: UserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Access token is missing, invalid, expired, or revoked.',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Customer profile was not found.',
    type: ApiErrorResponseDto,
  })
  getProfile(@Request() req: CustomerRequest): Promise<PublicUser> {
    return this.usersService.findById(req.user.id);
  }

  @Patch()
  @Messages(MESSAGES.UPDATED)
  @ApiOperation({ summary: 'Update the current customer profile' })
  @ApiEnvelopeResponse({
    status: 200,
    description: 'Current customer profile updated.',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Profile update payload validation failed.',
    type: ApiErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Access token is missing, invalid, expired, or revoked.',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Customer profile was not found.',
    type: ApiErrorResponseDto,
  })
  updateProfile(
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: CustomerRequest,
  ): Promise<PublicUser> {
    return this.usersService.update(req.user.id, updateUserDto);
  }
}
