import { Global, Module, Scope } from '@nestjs/common';
import { HashService } from './services/hash.service';
import { MailerService } from './services/mailer.service';

@Global()
@Module({
    providers: [
        HashService,                                      // singleton
        {                                                 // Custom provider example
            provide: 'REQUEST_TIME',
            useFactory: () => new Date(),
            scope: Scope.TRANSIENT,
        },
        MailerService,                                    // async init inside service constructor
    ],
    exports: ['REQUEST_TIME', HashService, MailerService],
})
export class SharedModule { }
