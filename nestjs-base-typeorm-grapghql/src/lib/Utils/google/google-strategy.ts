// GoogleStrategy file
import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { ConstantConfig } from 'src/lib/constant/constant.config';

@Injectable()
export class GoogleStrategy {
    constructor(private constant: ConstantConfig){};

    private client = new OAuth2Client(process.env.GOOGLE_CONSUMER_KEY);

    async validateIdToken(idToken: string) {
        if (!idToken) {
            throw new Error(this.constant.error.auth.google.idTokenError);
        }

        try {
            const ticket = await this.client.verifyIdToken({
                idToken: idToken,
            });
            const payload = ticket.getPayload();
            const currentTime = Math.floor(Date.now() / 1000);

            if (!payload || payload.exp < currentTime) {
                throw new Error(this.constant.error.auth.google.invalidToken);
            }

            return payload;
        } catch (error) {
            if (error.message.includes('Token used too late')) {
                throw new Error(this.constant.error.auth.google.tokenExpiredError);
            } else {
                throw error;
            }
        }
    }
}