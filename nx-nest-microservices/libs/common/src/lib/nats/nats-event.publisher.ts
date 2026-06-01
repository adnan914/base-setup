import { NatsSubject } from '@ecommerce/contracts';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, NatsConnection, StringCodec } from 'nats';

@Injectable()
export class NatsEventPublisher implements OnModuleInit, OnModuleDestroy {
  private connection?: NatsConnection;
  private readonly codec = StringCodec();

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    this.connection = await connect({ servers: this.config.getOrThrow<string>('nats.url') });
  }

  async publish<T extends object>(subject: NatsSubject, payload: T) {
    this.connection?.publish(subject, this.codec.encode(JSON.stringify(payload)));
  }

  async onModuleDestroy() {
    await this.connection?.drain();
  }
}
