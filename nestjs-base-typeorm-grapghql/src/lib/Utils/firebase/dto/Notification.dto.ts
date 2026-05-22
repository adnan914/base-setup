import { IsString } from 'class-validator';

export class NotificationDto {
  @IsString()
  deviceToken: string;

  @IsString()
  platform: string;

  @IsString()
  title: string;

  @IsString()
  body: string;
}
