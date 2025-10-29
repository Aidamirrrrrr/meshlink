import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { SignalingGateway } from './signaling.gateway';

@Injectable()
export class RoomCleanupService {
    private readonly logger = new Logger(RoomCleanupService.name);

    constructor(private readonly signalingGateway: SignalingGateway) {}

    @Cron(CronExpression.EVERY_5_MINUTES)
    handleRoomCleanup() {
        const rooms = this.signalingGateway.server.sockets.adapter.rooms;
        let cleanedCount = 0;

        for (const [roomId, sockets] of rooms) {
            if (sockets.has(roomId)) {
                continue;
            }

            if (sockets.size === 0) {
                this.logger.debug(`Cleaning up empty room: ${roomId}`);
                cleanedCount++;
            }
        }

        if (cleanedCount > 0) {
            this.logger.log(`Cleaned up ${cleanedCount} empty rooms`);
        }
    }
}
