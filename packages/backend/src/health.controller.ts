import { Controller, Get } from '@nestjs/common';

import { SignalingGateway } from './signaling.gateway';

@Controller('health')
export class HealthController {
    constructor(private readonly signalingGateway: SignalingGateway) {}

    @Get()
    check() {
        const rooms = this.signalingGateway.server.sockets.adapter.rooms;
        const sockets = this.signalingGateway.server.sockets.sockets;

        let activeRooms = 0;
        for (const [roomId, members] of rooms) {
            if (!members.has(roomId)) {
                activeRooms++;
            }
        }

        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            connections: sockets.size,
            rooms: activeRooms,
        };
    }
}
