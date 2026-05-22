import { config } from 'dotenv';
config();
import * as AWS from 'aws-sdk';

class SnsService {
  private sns: AWS.SNS;
  private endpoints: { [deviceToken: string]: string };

  constructor() {
    this.sns = new AWS.SNS({
        region: process.env.AWS_SNS_REGION,
        secretAccessKey: process.env.AWS_SNS_ACCESS_KEY,
        accessKeyId: process.env.AWS_SNS_SECRET_KEY,
    });
    this.endpoints = {};
  }

  private async createDeviceEndpoint(deviceToken: string): Promise<string> {
    if (this.endpoints[deviceToken]) {
      return this.endpoints[deviceToken];
    }

    const params: AWS.SNS.CreatePlatformEndpointInput = {
      PlatformApplicationArn:process.env.AWS_SNS_PlATFORM_ARN,
      Token: deviceToken,
    };

    try {
      const createEndpointResponse = await this.sns.createPlatformEndpoint(params).promise();
      this.endpoints[deviceToken] = createEndpointResponse.EndpointArn!;
      return createEndpointResponse.EndpointArn!;
    } catch (error:any) {
      throw new Error(`Error creating device endpoint: ${error.message}`);
    }
  }

  public async sendPushNotification(deviceToken: string, message: string): Promise<void> {
    try {
      const endpointArn = await this.createDeviceEndpoint(deviceToken);
      const params: AWS.SNS.PublishInput = {
        Message: JSON.stringify({
          default: message,
          APNS: JSON.stringify({
            aps: {
              alert: message,
              sound: 'default',
              badge: 1,
            },
          }),
        }),
        MessageStructure: 'json',
        TargetArn: endpointArn,
      };
      await this.sns.publish(params).promise();
      console.log('Push notification sent successfully.');
    } catch (error) {
      console.error(`Error sending push notification: ${error}`);
    }
  }
}

export async function sendPushNotification(deviceToken: string, message: string): Promise<void> {
  const snsService = new SnsService();
  return snsService.sendPushNotification(deviceToken, message);
}
