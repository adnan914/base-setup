import { Injectable } from '@nestjs/common';
import { ConstantConfig } from '../../constant/constant.config';
import { Twilio } from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID ;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_FROM;

@Injectable()
export class TwilioService {
  constructor(private constant: ConstantConfig) {}

  async sendSMSService(phone:string, message: any): Promise<any> {
    if (!(accountSid && authToken && twilioNumber && phone && message)) {
      throw new Error(this.constant.error.twilio.unableToSendSms);
    }

    try {
      const client = new Twilio(accountSid, authToken);
      const response = await client.messages.create({
          from: twilioNumber,
          to: phone,
          body: message,
        });
      return response;
    } catch(e) {
      throw new Error(e.message);
    }
  }

  async makeCallService(phone: string, message: any): Promise<any> {
    if (!(accountSid && authToken && twilioNumber && phone)) {
      throw new Error(this.constant.error.twilio.unableToSendSms);
    }

    try {
      const client = new Twilio(accountSid, authToken);
      const response = await client.calls.create({
        twiml: `<Response>${message}</Response>`,
        to: phone,
        from: twilioNumber
      });

      return response;
    } catch(e) {
      throw new Error(e.message);
    }
  }

  async checkPhoneService(number: any): Promise<any> {
    if (!(accountSid && authToken && twilioNumber)) {
      throw new Error(this.constant.error.twilio.missingVariable);
    }

    try {
      const client = new Twilio(accountSid, authToken);
      const phone_number = await client.lookups.v2.phoneNumbers(number).fetch({fields: 'sim_swap,call_forwarding'});
      return phone_number.valid;
    } catch(e) {
      throw new Error(e.message);
    }
  }
}
