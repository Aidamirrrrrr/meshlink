import { useCallback, useEffect, useRef, useState } from 'react';

import { WEBRTC_CONSTANTS } from '@/shared/constants/webrtc';
import { createLogger } from '@/shared/lib/logger';

import { ICE_SERVERS } from '../model/ice';

const logger = createLogger('PeerConnections');

export type PeerState = {
    pc: RTCPeerConnection;
    remoteSet: boolean;
    pending: RTCIceCandidateInit[];
    receivedTracks: Set<string>;
};

type UsePeerConnectionsParams = {
    iceServers?: RTCIceServer[];
    localStream: MediaStream | null;
    onSignal: (to: string, data: unknown) => void;
};

export function usePeerConnections({ iceServers = ICE_SERVERS, localStream, onSignal }: UsePeerConnectionsParams) {
    const peersRef = useRef<Record<string, PeerState>>({});
    const localStreamRef = useRef<MediaStream | null>(localStream);

    const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
    const [remoteCamStatus, setRemoteCamStatus] = useState<Record<string, boolean>>({});
    const [remoteMicStatus, setRemoteMicStatus] = useState<Record<string, boolean>>({});
    const [remoteScreenStatus, setRemoteScreenStatus] = useState<Record<string, boolean>>({});

    useEffect(() => {
        localStreamRef.current = localStream;
    }, [localStream]);

    const ensurePeer = useCallback(
        (peerId: string): PeerState => {
            let ps = peersRef.current[peerId];
            if (ps) return ps;

            const pc = new RTCPeerConnection({ iceServers, iceCandidatePoolSize: 8 });
            ps = peersRef.current[peerId] = { pc, remoteSet: false, pending: [], receivedTracks: new Set() };

            const currentStream = localStreamRef.current;
            if (currentStream) {
                logger.log(`Adding ${currentStream.getTracks().length} local tracks to peer ${peerId}`);
                currentStream.getTracks().forEach((track) => {
                    logger.log(`Adding ${track.kind} track to ${peerId}`);
                    pc.addTrack(track, currentStream);
                });
            } else {
                logger.log(`localStream not yet available for peer ${peerId}, will be added by useEffect`);
            }

            pc.ontrack = (event) => {
                const [remoteStream] = event.streams;
                const trackId = event.track.id;

                if (!remoteStream) return;

                if (ps.receivedTracks.has(trackId)) {
                    logger.debug(`Track ${trackId} already received from ${peerId}, ignoring`);
                    return;
                }

                ps.receivedTracks.add(trackId);
                logger.log(`Received remote ${event.track.kind} track from ${peerId}`);
                logger.log(`Remote stream tracks count: ${remoteStream.getTracks().length}`);

                setRemoteStreams((prev) => {
                    if (prev[peerId]?.id === remoteStream.id) {
                        logger.log(`Remote stream already set for ${peerId}`);
                        return prev;
                    }
                    logger.log(`Adding remote stream for ${peerId}:`, remoteStream);
                    return { ...prev, [peerId]: remoteStream };
                });
            };

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    onSignal(peerId, event.candidate);
                }
            };

            pc.onicecandidateerror = (event) => {
                logger.debug(`ICE candidate error for ${peerId} (expected):`, event);
            };

            pc.onconnectionstatechange = () => {
                const state = pc.connectionState;
                logger.log(`Peer ${peerId} connection state: ${state}`);

                if (state === 'failed' || state === 'closed') {
                    logger.warn(`Connection ${state} for peer ${peerId}, removing`);
                    removePeer(peerId);
                }

                if (state === 'disconnected') {
                    logger.warn(
                        `Peer ${peerId} disconnected, will remove if not reconnected in ${WEBRTC_CONSTANTS.RECONNECT_TIMEOUT_MS / 1000}s`,
                    );
                    setTimeout(() => {
                        const currentPc = peersRef.current[peerId]?.pc;
                        if (currentPc && currentPc.connectionState === 'disconnected') {
                            logger.warn(`Peer ${peerId} still disconnected, removing`);
                            removePeer(peerId);
                        }
                    }, WEBRTC_CONSTANTS.RECONNECT_TIMEOUT_MS);
                }
            };

            pc.oniceconnectionstatechange = () => {
                const state = pc.iceConnectionState;
                logger.debug(`ICE ${peerId}: ${state}`);

                if (state === 'failed') {
                    logger.warn(`ICE failed for ${peerId}, attempting restart`);
                    pc.restartIce();
                }
            };

            return ps;
        },
        [iceServers, localStream, onSignal],
    );

    const makeOffer = async (peerId: string) => {
        const ps = ensurePeer(peerId);

        try {
            const offer = await ps.pc.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true,
            });
            await ps.pc.setLocalDescription(offer);
            onSignal(peerId, offer);
            logger.log(`Sent offer to ${peerId}`);
        } catch (error) {
            logger.error(`Failed to create offer for ${peerId}:`, error);
        }
    };

    const handleSignal = async (from: string, data: unknown) => {
        const ps = peersRef.current[from] || ensurePeer(from);
        const pc = ps.pc;

        try {
            const desc = data as RTCSessionDescriptionInit | RTCIceCandidateInit;

            if ('type' in desc && (desc.type === 'offer' || desc.type === 'answer')) {
                if (desc.type === 'offer') {
                    await pc.setRemoteDescription(desc);
                    ps.remoteSet = true;

                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    onSignal(from, answer);
                    logger.log(`Sent answer to ${from}`);

                    for (const candidate of ps.pending) {
                        await pc.addIceCandidate(candidate);
                    }
                    ps.pending = [];
                } else if (desc.type === 'answer') {
                    await pc.setRemoteDescription(desc);
                    ps.remoteSet = true;
                }
            } else if ('candidate' in desc) {
                if (ps.remoteSet) {
                    await pc.addIceCandidate(desc);
                } else {
                    ps.pending.push(desc);
                }
            }
        } catch (error) {
            logger.error(`Error handling signal from ${from}:`, error);
        }
    };

    const removePeer = (peerId: string) => {
        const ps = peersRef.current[peerId];
        if (ps) {
            try {
                ps.pc.close();
            } catch (error) {
                logger.warn('Failed to close peer connection:', error);
            }
            delete peersRef.current[peerId];
        }

        setRemoteStreams((prev) => {
            const next = { ...prev };
            delete next[peerId];
            return next;
        });
        setRemoteCamStatus((prev) => {
            const next = { ...prev };
            delete next[peerId];
            return next;
        });
        setRemoteMicStatus((prev) => {
            const next = { ...prev };
            delete next[peerId];
            return next;
        });
        setRemoteScreenStatus((prev) => {
            const next = { ...prev };
            delete next[peerId];
            return next;
        });
    };

    const closeAllPeers = () => {
        Object.keys(peersRef.current).forEach((peerId) => {
            try {
                peersRef.current[peerId].pc.close();
            } catch (error) {
                logger.warn('Failed to close peer connection:', error);
            }
        });

        peersRef.current = {};
        setRemoteStreams({});
        setRemoteCamStatus({});
        setRemoteMicStatus({});
        setRemoteScreenStatus({});
    };

    const getVideoSenders = (): RTCRtpSender[] => {
        const senders: RTCRtpSender[] = [];
        Object.values(peersRef.current).forEach(({ pc }) => {
            pc.getSenders().forEach((s) => {
                if (s.track?.kind === 'video') senders.push(s);
            });
        });
        return senders;
    };

    const getAudioSenders = (): RTCRtpSender[] => {
        const senders: RTCRtpSender[] = [];
        Object.values(peersRef.current).forEach(({ pc }) => {
            pc.getSenders().forEach((s) => {
                if (s.track?.kind === 'audio') senders.push(s);
            });
        });
        return senders;
    };

    const updatePeerMediaState = (peerId: string, camOn: boolean, micOn: boolean, screenOn: boolean) => {
        setRemoteCamStatus((prev) => ({ ...prev, [peerId]: camOn }));
        setRemoteMicStatus((prev) => ({ ...prev, [peerId]: micOn }));
        setRemoteScreenStatus((prev) => ({ ...prev, [peerId]: screenOn }));
    };

    useEffect(() => {
        if (!localStream) return;

        Object.entries(peersRef.current).forEach(([peerId, ps]) => {
            const existingSenders = ps.pc.getSenders();
            const hasVideoSender = existingSenders.some((s) => s.track?.kind === 'video');
            const hasAudioSender = existingSenders.some((s) => s.track?.kind === 'audio');

            if (!hasVideoSender || !hasAudioSender) {
                logger.log(`Fallback: Adding missing tracks to peer ${peerId}`);
                localStream.getTracks().forEach((track) => {
                    const hasTrack = existingSenders.some((s) => s.track?.id === track.id);
                    if (!hasTrack) {
                        logger.log(`Adding ${track.kind} track to ${peerId}`);
                        ps.pc.addTrack(track, localStream);
                    }
                });
            }
        });
    }, [localStream]);

    return {
        remoteStreams,
        remoteCamStatus,
        remoteMicStatus,
        remoteScreenStatus,
        peersRef,

        ensurePeer,
        makeOffer,
        handleSignal,
        removePeer,
        closeAllPeers,
        getVideoSenders,
        getAudioSenders,
        updatePeerMediaState,
    };
}
