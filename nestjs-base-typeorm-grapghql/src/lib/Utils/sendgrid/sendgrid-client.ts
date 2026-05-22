/* eslint-disable prettier/prettier */
import { config } from 'dotenv';
config();
import { Injectable } from '@nestjs/common';
import { MailDataRequired } from '@sendgrid/mail';
import * as SendGrid from '@sendgrid/mail';
import { ConstantConfig } from 'src/lib/constant/constant.config';

@Injectable()
export class SendGridClient {
  constructor(private constant: ConstantConfig) {
    SendGrid.setApiKey(process.env.SENDGRID_API_KEY);
  }
  async send(mail: MailDataRequired): Promise<void> {
    try {
      await SendGrid.send(mail);
      console.log(`Email successfully dispatched to ${mail.to as string}`);
    } catch (error) {
      console.log(this.constant.error.auth.sendEmailError, error);
      throw error;
    }
  }
}
