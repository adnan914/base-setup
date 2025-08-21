import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { DiscoveryScannerService } from './discovery.service';

@Module({
    imports: [DiscoveryModule],
    providers: [DiscoveryScannerService],
    exports: [DiscoveryScannerService],
})
export class DiscoveryFeatureModule { }
