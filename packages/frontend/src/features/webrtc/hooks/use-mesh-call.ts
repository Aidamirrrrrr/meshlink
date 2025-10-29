import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { createLogger } from '@/shared/lib/logger';

import { ICE_SERVERS } from '../model/ice';

const logger = createLogger('MeshCall');
import { useMediaDevices } from './use-media-devices';
import { usePeerConnections } from './use-peer-connections';
import { useSignaling } from './use-signaling';

type UseMeshCallParams = {
    signalingUrl: string;
    iceServers?: RTCIceServer[];
};

export function useMeshCall({ signalingUrl, iceServers = ICE_SERVERS }: UseMeshCallParams) {
    const navigate = useNavigate();
    const roomIdRef = useRef<string>('');
    const [started, setStarted] = useState(false);

    const media = useMediaDevices();

    const signaling = useSignaling(signalingUrl, {
        onPeerJoined: (peerId) => {
            peers.ensurePeer(peerId);
        },
        onPeerLeft: (peerId) => {
            peers.removePeer(peerId);
        },
        onRoomInfo: (peerIds) => {
            if (peerIds.length === 0) {
                logger.log('No peers in room yet');
                return;
            }
            peerIds.forEach((peerId) => {
                peers.ensurePeer(peerId);
                void peers.makeOffer(peerId);
            });
        },
        onSignal: (from, data) => {
            void peers.handleSignal(from, data);
        },
        onMediaState: (peerId, camOn, micOn, screenOn) => {
            peers.updatePeerMediaState(peerId, camOn, micOn, screenOn);
        },
        onError: (error) => {
            if (error.code === 'ROOM_FULL') {
                setTimeout(() => navigate('/'), 2000);
            }
        },
    });

    const peers = usePeerConnections({
        iceServers,
        localStream: media.localStream,
        onSignal: (to, data) => {
            signaling.emit('signal', {
                roomId: roomIdRef.current,
                to,
                data,
            });
        },
    });

    const start = useCallback(
        async (roomId: string, localVideoEl: HTMLVideoElement) => {
            if (started) return;

            try {
                const socket = signaling.getSocket();
                if (!socket) {
                    throw new Error('Failed to initialize WebSocket');
                }

                const { stream, config } = await media.getUserMedia();

                media.localStreamRef.current = stream;
                media.setLocalStream(stream); 
                localVideoEl.srcObject = stream;
                media.setCamOn(config.hasCam);
                media.setMicOn(config.hasMic);

                roomIdRef.current = roomId;
                socket.emit('join', { roomId });
                setStarted(true);

                socket.emit('media-state', {
                    roomId,
                    camOn: config.hasCam,
                    micOn: config.hasMic,
                    screenOn: false,
                });

                logger.log('Joined room:', roomId);
                toast.success('Connected to room');
            } catch (error) {
                logger.error('Error starting video conference:', error);
                toast.error('Failed to start video call');
                throw error;
            }
        },
        [started, signaling, media],
    );

    const hangup = useCallback(() => {
        signaling.emit('leave', { roomId: roomIdRef.current });

        peers.closeAllPeers();
        media.stopAllTracks();

        setStarted(false);
        signaling.disconnect();

        logger.log('Call ended');
    }, [signaling, peers, media]);

    const toggleCam = useCallback(async () => {
        const videoSenders = peers.getVideoSenders();
        await media.toggleCamera(videoSenders);

        signaling.emit('media-state', {
            roomId: roomIdRef.current,
            camOn: !media.camOn,
            micOn: media.micOn,
            screenOn: media.screenOn,
        });
    }, [media, peers, signaling]);

    const toggleMic = useCallback(async () => {
        const audioSenders = peers.getAudioSenders();
        await media.toggleMicrophone(audioSenders);

        signaling.emit('media-state', {
            roomId: roomIdRef.current,
            camOn: media.camOn,
            micOn: !media.micOn,
            screenOn: media.screenOn,
        });
    }, [media, peers, signaling]);

    const toggleScreen = useCallback(async () => {
        const videoSenders = peers.getVideoSenders();
        await media.toggleScreenShare(videoSenders);

        signaling.emit('media-state', {
            roomId: roomIdRef.current,
            camOn: !media.screenOn && media.camOn,
            micOn: media.micOn,
            screenOn: !media.screenOn,
        });
    }, [media, peers, signaling]);

    return {
        remoteStreams: peers.remoteStreams,
        remoteCamStatus: peers.remoteCamStatus,
        remoteMicStatus: peers.remoteMicStatus,
        remoteScreenStatus: peers.remoteScreenStatus,
        started,
        micOn: media.micOn,
        camOn: media.camOn,
        screenOn: media.screenOn,

        start,
        hangup,
        toggleCam,
        toggleMic,
        toggleScreen,
    };
}
