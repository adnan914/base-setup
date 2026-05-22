/* eslint-disable @typescript-eslint/no-unused-vars */
import { AwsService } from '../../lib/Utils/aws/aws.service';
import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PayloadDto } from './dtos/PayloadDto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('config')
export class ConfigController {
  constructor(private awsservice: AwsService) {}
  //will check aws services
  @Patch()
  @UseGuards(JwtAuthGuard)
  async presigned(@Body() payloadDto: PayloadDto, @Req() req) {
    try {
      const UserId = req.user?.id;
      const attendance = await this.awsservice.getPresignedUrlForArray(
        UserId,
        payloadDto,
      );
      return { success: true, data: attendance };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
