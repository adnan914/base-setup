
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import admin from './firebase-admin';
import axios from 'axios';

@Injectable()
export class FirebaseService {
  private messaging: admin.messaging.Messaging;
  constructor() {
    this.messaging = admin.messaging();
  }

  async pushNotification(token: string, platform: string, title: any, body: any, key: any): Promise<any> {
    try {
      if (platform === 'android') {
        const data = { title, ...body };
        let payload = {
          data,
        };
        let options = {
          priority: 'high',
          timeToLive: 60 * 60 * 24,
        };

        const result = await this.messaging.sendToDevice(token, payload, options);
        console.log('Successfully sent message:', result);
        return result;
      } else if (platform === 'ios') {
        const payload = {
          to: token,
          notification: {
            title,
            body,
            badge: 1,
            sound: 'default',
            key,
          },
        };

        const response = await axios.post('https://fcm.googleapis.com/fcm/send', payload, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `key=${process.env.FIREBASE_SERVER_KEY}`,
          },
        });
        console.log('Response:', response.data);
        return response.data;
      } else {
        throw new HttpException(
          { success: false, message: `Platform not supported: ${platform}` },
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      console.error('Error:', error);

      const errorMessage = error.response?.data?.error ;
      throw new HttpException(
        { success: false, message: errorMessage, error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async generateFirebaseToken(userID: string): Promise<string> {
    const auth = admin.auth();

    try {
      const uid = userID;
      const additionalClaims = {
        premiumAccount: true,
      };

      const customToken = await auth.createCustomToken(uid, additionalClaims);
      return customToken;
    } catch (error) {
      throw error;
    }
  }
}
