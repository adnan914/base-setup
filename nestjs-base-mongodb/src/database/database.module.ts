import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GlobalConfigModule } from '../config/config.module'; // 👈 import the module
import { GlobalConfigService } from '../config/config.service'; // 👈 import the module

@Module({
    imports: [
        GlobalConfigModule, // 👈 now MongooseCoreModule can access GlobalConfigService
        MongooseModule.forRootAsync({
            inject: [GlobalConfigService],
            useFactory: async (config: GlobalConfigService) => ({
                uri: config.getMongoUri(),
            }),
        }),
    ],
})
export class MongooseCoreModule { }