import { Injectable, OnModuleInit } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class MailerService implements OnModuleInit {
    private transporter: nodemailer.Transporter | null = null;

    async onModuleInit() {
        this.transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
        });
    }

    async send(to: string, subject: string, text: string) {
        if (!this.transporter) return;
        await this.transporter.sendMail({ to, subject, text, from: 'noreply@example.com' });
    }
}
