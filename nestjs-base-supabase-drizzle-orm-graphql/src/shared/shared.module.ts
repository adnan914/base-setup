import { Module, Global } from '@nestjs/common';
import { WinstonLogger } from './logger/winston.logger';

@Global()
@Module({
  providers: [WinstonLogger],
  exports: [WinstonLogger],
})
export class SharedModule {}
