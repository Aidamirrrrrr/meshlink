export interface ServerToClientEvents {
    'room-info': (data: { peers: string[]; size: number }) => void;
    'peer-joined': (data: { peerId: string }) => void;
    'peer-left': (data: { peerId: string }) => void;
    signal: (data: { from: string; data: unknown }) => void;
    'media-state': (data: { peerId: string; camOn: boolean; micOn: boolean; screenOn: boolean }) => void;
    error: (data: { event: string; code: string; message: string; maxParticipants?: number }) => void;
}

export interface ClientToServerEvents {
    join: (data: { roomId: string }) => void;
    leave: (data: { roomId: string }) => void;
    signal: (data: { roomId: string; to?: string; data: unknown }) => void;
    'media-state': (data: { roomId: string; camOn: boolean; micOn: boolean; screenOn: boolean }) => void;
}
