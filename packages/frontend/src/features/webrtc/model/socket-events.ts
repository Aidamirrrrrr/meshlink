export const SOCKET_EVENTS = {
    JOIN: 'join',
    LEAVE: 'leave',
    SIGNAL: 'signal',
    MEDIA_STATE: 'media-state',

    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    ROOM_INFO: 'room-info',
    PEER_JOINED: 'peer-joined',
    PEER_LEFT: 'peer-left',
    PING_CHECK: 'ping-check',
    PONG_CHECK: 'pong-check',
} as const;

export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
