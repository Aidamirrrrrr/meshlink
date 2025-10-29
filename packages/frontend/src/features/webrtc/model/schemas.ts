import { z } from 'zod';

export const JoinSchema = z.object({
    roomId: z.string().min(1),
});

export const PeerJoinedSchema = z.object({
    peerId: z.string(),
});

export const PeerLeftSchema = z.object({
    peerId: z.string(),
});

export const RoomInfoSchema = z.object({
    size: z.number().int().nonnegative(),
    peers: z.array(z.string()),
});

export const SignalSchema = z.object({
    from: z.string().optional(),
    to: z.string().optional(),
    data: z
        .object({
            type: z.string().optional(),
            sdp: z.string().optional(),
            candidate: z.string().nullable().optional(),
            sdpMid: z.string().nullable().optional(),
            sdpMLineIndex: z.number().nullable().optional(),
        })
        .loose(),
});

export type JoinPayload = z.infer<typeof JoinSchema>;
export type RoomInfo = z.infer<typeof RoomInfoSchema>;
export type PeerJoined = z.infer<typeof PeerJoinedSchema>;
export type PeerLeft = z.infer<typeof PeerLeftSchema>;
export type SignalMsg = z.infer<typeof SignalSchema>;
