import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { JwtAuthGuard, Messages, RES_MESSAGES } from '@lib/core/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

type AuthenticatedRequest = Request & {
  user?: {
    id?: string;
  };
};

type UploadedProfileImage = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};

const ALLOWED_PROFILE_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_PROFILE_IMAGE_SIZE = 2 * 1024 * 1024;

@ApiTags('profiles')
@Controller('profiles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProfilesController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({ description: 'Profile fetched successfully' })
  @Messages(RES_MESSAGES.DATA_FOUND)
  async getMyProfile(@Req() request: AuthenticatedRequest) {
    const userId = request.user?.id;
    if (!userId) {
      throw new BadRequestException('Unable to identify the current user.');
    }
    return this.usersService.getMyProfile(userId);
  }

  @Patch('me')
  @UseInterceptors(FileInterceptor('profileImage'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        password: { type: 'string' },
        profileImage: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiOkResponse({ description: 'Profile updated successfully' })
  @Messages(RES_MESSAGES.UPDATED)
  async updateMyProfile(
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdateProfileDto,
    @UploadedFile() profileImage?: UploadedProfileImage,
  ) {
    const userId = request.user?.id;
    if (!userId) {
      throw new BadRequestException('Unable to identify the current user.');
    }

    if (profileImage) {
      if (!ALLOWED_PROFILE_IMAGE_TYPES.includes(profileImage.mimetype)) {
        throw new BadRequestException(
          'Only JPG, PNG, and WEBP profile images are allowed.',
        );
      }
      if (profileImage.size > MAX_PROFILE_IMAGE_SIZE) {
        throw new BadRequestException('Profile image must not exceed 2MB.');
      }
    }

    return this.usersService.updateMyProfile(userId, dto, profileImage ?? null);
  }
}
