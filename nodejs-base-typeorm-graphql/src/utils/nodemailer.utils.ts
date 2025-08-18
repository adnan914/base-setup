import nodemailer from 'nodemailer';

export class NodemailerUtils {
    static async sendResetEmail(email: string, link: string) {
       
        const transporter = nodemailer.createTransport({
            service: process.env.SMTP_SERVICE,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        const mailOptions = {
            to: email,
            subject: 'Reset Your Password',
            html: `<p>Click below to reset your password:</p><a href="${link}">${link}</a>`
        };

        return await transporter.sendMail(mailOptions);

    }
}
