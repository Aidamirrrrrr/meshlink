import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { toast } from 'sonner';

import { createLogger } from '@/shared/lib/logger';

import { PeerJoinedSchema, PeerLeftSchema, RoomInfoSchema, SignalSchema } from '../model/schemas';

const logger = createLogger('Signaling');

export type SignalingCallbacks = {
    onPeerJoined: (peerId: string) => void;
    onPeerLeft: (peerId: string) => void;
    onRoomInfo: (peers: string[]) => void;
    onSignal: (from: string, data: unknown) => void;
    onMediaState: (peerId: string, camOn: boolean, micOn: boolean, screenOn: boolean) => void;
    onError?: (error: { event: string; code: string; message: string; maxParticipants?: number }) => void;
};

export function useSignaling(signalingUrl: string, callbacks: SignalingCallbacks) {
    const socketRef = useRef<Socket | null>(null);
    const initializingRef = useRef(false);

    const getSocket = (): Socket | null => {
        if (socketRef.current) return socketRef.current;
        if (initializingRef.current) return null;

        initializingRef.current = true;
        const socket = io(signalingUrl, { transports: ['websocket'] });
        socketRef.current = socket;
        initializingRef.current = false;

        socket.on('connect', () => logger.log('WebSocket connected'));
        socket.on('disconnect', (reason) => {
            logger.warn(`WebSocket disconnected: ${reason}`);
            if (reason === 'io server disconnect') {
                logger.info('Reconnecting...');
                socket.connect();
            }
        });
        socket.on('connect_error', (error) => {
            logger.error('WebSocket connection error:', error);
            toast.error('Failed to connect to server');
        });

        socket.on('error', (error: { event: string; code: string; message: string; maxParticipants?: number }) => {
            logger.error('Server error:', error);

            if (error.code === 'ROOM_FULL') {
                toast.error(`Room is full (max ${error.maxParticipants || 10} participants)`);
            } else if (error.code === 'JOIN_FAILED') {
                toast.error('Failed to join room');
            } else if (error.code === 'SIGNAL_FAILED') {
                toast.error('Connection error occurred');
            } else {
                toast.error(error.message || 'An error occurred');
            }

            callbacks.onError?.(error);
        });

        socket.on('peer-left', (raw: unknown) => {
            const parsed = PeerLeftSchema.safeParse(raw);
            if (parsed.success) {
                logger.log(`Peer left: ${parsed.data.peerId}`);
                callbacks.onPeerLeft(parsed.data.peerId);
            } else {
                logger.warn('Invalid peer-left payload:', raw);
            }
        });

        socket.on('peer-joined', (raw: unknown) => {
            const parsed = PeerJoinedSchema.safeParse(raw);
            if (parsed.success) {
                logger.log(`Peer joined: ${parsed.data.peerId}`);
                callbacks.onPeerJoined(parsed.data.peerId);
            } else {
                logger.warn('Invalid peer-joined payload:', raw);
            }
        });

        socket.on('room-info', (raw: unknown) => {
            const parsed = RoomInfoSchema.safeParse(raw);
            if (!parsed.success) {
                logger.warn('Invalid room-info payload:', raw);
                return;
            }
            const { peers } = parsed.data;
            logger.log(`Room info: ${peers.length} peers`);
            callbacks.onRoomInfo(peers);
        });

        socket.on('signal', (raw: unknown) => {
            const parsed = SignalSchema.safeParse(raw);
            if (!parsed.success) {
                logger.warn('Invalid signal payload:', raw);
                return;
            }
            const { from, data } = parsed.data;
            if (from) {
                callbacks.onSignal(from, data);
            } else {
                logger.warn('Signal received without sender ID');
            }
        });

        socket.on('media-state', (payload: { peerId: string; camOn: boolean; micOn: boolean; screenOn: boolean }) => {
            callbacks.onMediaState(payload.peerId, payload.camOn, payload.micOn, payload.screenOn);
        });

        return socket;
    };

    useEffect(() => {
        return () => {
            socketRef.current?.disconnect();
            socketRef.current = null;
        };
    }, []);

    return {
        socket: socketRef.current,
        getSocket,
        emit: (event: string, data: unknown) => socketRef.current?.emit(event, data),
        disconnect: () => {
            socketRef.current?.disconnect();
            socketRef.current = null;
        },
    };
}
