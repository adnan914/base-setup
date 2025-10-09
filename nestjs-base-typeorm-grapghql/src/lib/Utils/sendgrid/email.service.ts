/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { MailDataRequired } from '@sendgrid/mail';
import { SendGridClient } from './sendgrid-client';

@Injectable()
export class EmailService {
  constructor(private readonly sendGridClient: SendGridClient) {}

  async sendTestEmail(email: string, body: string): Promise<void> {
    const mail: MailDataRequired = {
      to: email,
      from: process.env.SENDGRID_FROM,
      subject: 'Test email',
      content: [{ type: 'text/plain', value: body }],
    };
    await this.sendGridClient.send(mail);
  }

  async sendEmailWithTemplate(email: string, body: string): Promise<void> {
    const mail: MailDataRequired = {
      to: email,
      cc: 'ankitsharam@bitcot.com',
      from: process.env.SENDGRID_FROM,
      templateId: 'd-7a02fba04b1d45629e1fbf192eea70e9',
      dynamicTemplateData: { body, subject: 'Send Email with template' },
    };
    await this.sendGridClient.send(mail);
  }
}
