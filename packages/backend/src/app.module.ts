import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

import { validate } from './config/env.validation';
import { SignalingGateway } from './signaling.gateway';
import { RoomCleanupService } from './room-cleanup.service';
import { HealthController } from './health.controller';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validate,
        }),
        ThrottlerModule.forRoot([
            {
                name: 'short',
                ttl: 1000,
                limit: 10,
            },
            {
                name: 'long',
                ttl: 60000,
                limit: 100,
            },
        ]),
        ScheduleModule.forRoot(),
    ],
    controllers: [HealthController],
    providers: [SignalingGateway, RoomCleanupService],
})
export class AppModule {}
