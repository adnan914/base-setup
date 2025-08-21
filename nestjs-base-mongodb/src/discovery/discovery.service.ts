import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { DISCOVERABLE_KEY } from '../common/decorators/discoverable.decorator';
import 'reflect-metadata';

@Injectable()
export class DiscoveryScannerService implements OnModuleInit {
    private readonly logger = new Logger(DiscoveryScannerService.name);

    constructor(private readonly discovery: DiscoveryService) { }

    onModuleInit() {
        const providers = this.discovery.getProviders();
        for (const wrapper of providers) {
            const metatype = wrapper?.metatype as any;
            if (!metatype) continue;
            const tag = Reflect.getMetadata(DISCOVERABLE_KEY, metatype);
            if (tag) {
                this.logger.log(`Discovered provider: ${metatype.name} [tag=${tag}]`);
            }
        }
    }
}
