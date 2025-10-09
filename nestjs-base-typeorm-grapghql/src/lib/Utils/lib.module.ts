import { Module, forwardRef } from '@nestjs/common';
import { ConfigController } from '../../module/config/config.controller';
import { AwsService } from './aws/aws.service';
import { GoogleController } from './google/google.controller';
import { GoogleStrategy } from './google/google-strategy';
import { GoogleAuthService } from './google/google.service';
import { UsersModule } from 'src/module/users/users.module';
import { FacebookService } from './facebook/facebook.service';
import { FacebookController } from './facebook/facebook.controller';
import { FacebookStrategy } from './facebook/facebook.strategy';
import { EmailService } from './sendgrid/email.service';
import { SendGridClient } from './sendgrid/sendgrid-client';
import { StripeModule } from './stripe/stripe.module';
import { ConstantConfig } from '../constant/constant.config';
import { AuthModule } from 'src/module/auth/auth.module';
import { FirebaseController } from './firebase/firebase.controller';
import { FirebaseService } from './firebase/firebase.service';
import { TwilioService } from './twilio/twilio.service';

@Module({
  imports:[forwardRef(() => UsersModule),StripeModule, AuthModule],
  controllers: [ConfigController, GoogleController, FacebookController,FirebaseController],
  providers: [AwsService,GoogleStrategy,GoogleAuthService, FacebookService,FacebookStrategy, EmailService,
    SendGridClient, ConstantConfig, FirebaseService, TwilioService],
  exports: [AwsService,GoogleAuthService,FacebookStrategy, EmailService,TwilioService
    ],
})
export class LibsModule {}
