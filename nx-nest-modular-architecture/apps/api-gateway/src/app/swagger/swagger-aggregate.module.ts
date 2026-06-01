import { Module } from '@nestjs/common';
import { SwaggerAggregateController } from './swagger-aggregate.controller';
import { SwaggerAggregateService } from './swagger-aggregate.service';

@Module({
  controllers: [SwaggerAggregateController],
  providers: [SwaggerAggregateService],
})
export class SwaggerAggregateModule {}
