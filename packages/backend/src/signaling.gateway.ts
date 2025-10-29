import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { JoinRoomDto, LeaveRoomDto, MediaStateDto, SignalDto } from './dto/signaling.dto';

@WebSocketGateway({
    cors: {
        origin: process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()) || '*',
        credentials: true,
    },
})
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class SignalingGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(SignalingGateway.name);
    private readonly MAX_PARTICIPANTS_PER_ROOM = 10;

    @WebSocketServer() declare public server: Server;

    public handleConnection(socket: Socket): void {
        try {
            this.logger.log(`New WebSocket connection established: ${socket.id}`);

            socket.on('error', (error: Error) => {
                this.logger.error(`Socket ${socket.id} error:`, error);
            });
        } catch (error) {
            this.logger.error(`Error during connection handling for socket ${socket.id}:`, error);
        }
    }

    public handleDisconnect(socket: Socket): void {
        const { roomId } = socket.data;

        try {
            if (roomId) {
                socket.to(roomId).emit('peer-left', { peerId: socket.id });
                this.logger.log(`Socket ${socket.id} disconnected from room ${roomId}`);
            } else {
                this.logger.log(`Socket ${socket.id} disconnected`);
            }
        } catch (error) {
            this.logger.error(`Error during disconnect handling for socket ${socket.id}:`, error);
        }
    }

    @SubscribeMessage('join')
    public async onJoin(socket: Socket, payload: JoinRoomDto): Promise<void> {
        const { roomId } = payload;

        try {
            const room = this.server.sockets.adapter.rooms.get(roomId);

            if (room && room.size >= this.MAX_PARTICIPANTS_PER_ROOM) {
                this.logger.warn(`Room ${roomId} is full. Rejecting socket ${socket.id}`);
                socket.emit('error', {
                    event: 'join',
                    message: 'Room is full',
                    code: 'ROOM_FULL',
                    maxParticipants: this.MAX_PARTICIPANTS_PER_ROOM,
                });
                return;
            }

            socket.data.roomId = roomId;
            await socket.join(roomId);

            const updatedRoom = this.server.sockets.adapter.rooms.get(roomId);
            const peers = updatedRoom ? [...updatedRoom].filter((id) => id !== socket.id) : [];

            this.logger.log(
                `Socket ${socket.id} joined room ${roomId}. Room size: ${updatedRoom?.size || 1}, existing peers: ${peers.length}`,
            );

            socket.emit('room-info', { peers, size: updatedRoom ? updatedRoom.size : 0 });
            socket.to(roomId).emit('peer-joined', { peerId: socket.id });
        } catch (error) {
            this.logger.error(`Failed to join room ${roomId} for socket ${socket.id}:`, error);
            socket.emit('error', {
                event: 'join',
                message: 'Failed to join room',
                code: 'JOIN_FAILED',
            });
        }
    }

    @SubscribeMessage('signal')
    public onSignal(socket: Socket, payload: SignalDto): void {
        const { roomId, to, data } = payload;

        try {
            if (to) {
                this.logger.debug(`Relaying WebRTC signal from ${socket.id} to specific peer ${to}`);
                this.server.to(to).emit('signal', { from: socket.id, data });
            } else {
                this.logger.debug(`Broadcasting WebRTC signal from ${socket.id} to room ${roomId}`);
                socket.to(roomId).emit('signal', { from: socket.id, data });
            }
        } catch (error) {
            this.logger.error(`Failed to relay signal from ${socket.id}:`, error);
            socket.emit('error', {
                event: 'signal',
                message: 'Failed to relay signaling data',
                code: 'SIGNAL_FAILED',
            });
        }
    }

    @SubscribeMessage('media-state')
    public onMediaState(socket: Socket, payload: MediaStateDto): void {
        try {
            this.logger.debug(
                `Media state update from ${socket.id}: camera=${payload.camOn}, microphone=${payload.micOn}, screen=${payload.screenOn}`,
            );
            socket
                .to(payload.roomId)
                .emit('media-state', { peerId: socket.id, camOn: payload.camOn, micOn: payload.micOn, screenOn: payload.screenOn });
        } catch (error) {
            this.logger.error(`Failed to broadcast media state from ${socket.id}:`, error);
            socket.emit('error', {
                event: 'media-state',
                message: 'Failed to broadcast media state',
                code: 'MEDIA_STATE_FAILED',
            });
        }
    }

    @SubscribeMessage('leave')
    public async onLeave(socket: Socket, payload: LeaveRoomDto): Promise<void> {
        const { roomId } = payload;

        if (roomId) {
            try {
                this.logger.log(`Socket ${socket.id} leaving room ${roomId}`);
                socket.to(roomId).emit('peer-left', { peerId: socket.id });
                await socket.leave(roomId);
                socket.data.roomId = undefined;
            } catch (error) {
                this.logger.error(`Failed to leave room ${roomId} for socket ${socket.id}:`, error);
                socket.emit('error', {
                    event: 'leave',
                    message: 'Failed to leave room',
                    code: 'LEAVE_FAILED',
                });
            }
        }
    }
}
