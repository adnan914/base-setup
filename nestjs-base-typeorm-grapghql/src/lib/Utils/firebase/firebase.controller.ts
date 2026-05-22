import { Body, Controller, Post, Get, Res } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { NotificationDto } from './dto/Notification.dto';
import { ConstantConfig } from '../../constant/constant.config';

@Controller('firebase')
export class FirebaseController {
  constructor(private readonly notificationService: FirebaseService, private constant: ConstantConfig) {}

  @Post('send-notification')
  async sendNotification(@Body() notificationData: NotificationDto, @Res() res: any): Promise<void> {
    try {
      const { deviceToken, platform, title, body } = notificationData;
      const response = await this.notificationService.pushNotification(deviceToken, platform, title, body, '');

      if (response.success === 0) {
        res.status(400).json({ success: false, response });
      } else {
        res.status(200).json({ success: true, response });
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ success: false, error: error.message});
    }
  }

  @Get('generate-token')
  async generateToken(): Promise<string> {
    try {
      const userID = '1';
      const newToken = await this.notificationService.generateFirebaseToken(userID);
      return `New FCM Token: ${newToken}`;
    } catch (error) {
      console.error( error.message);
      return this.constant.error.auth.firebase.failedToGenerateFcm;
    }
  }
}
