import { useCallback, useRef, useState } from 'react';

import { createLogger } from '@/shared/lib/logger';

const logger = createLogger('MediaDevices');

export type MediaConfig = {
    hasCam: boolean;
    hasMic: boolean;
};

export function useMediaDevices() {
    const localStreamRef = useRef<MediaStream | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);

    const [camOn, setCamOn] = useState(true);
    const [micOn, setMicOn] = useState(true);
    const [screenOn, setScreenOn] = useState(false);

    const getUserMedia = async (): Promise<{ stream: MediaStream; config: MediaConfig }> => {
        const attempts = [
            { audio: true, video: true, label: 'audio + video' },
            { audio: true, video: false, label: 'audio only' },
            { audio: false, video: true, label: 'video only' },
        ];

        for (const { audio, video, label } of attempts) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio, video });
                logger.log(`Got ${label}`);
                return {
                    stream,
                    config: { hasCam: video, hasMic: audio },
                };
            } catch (error) {
                logger.warn(`Failed to get ${label}:`, error);
            }
        }

        throw new Error('No camera or microphone available');
    };

    const replaceTrackForSenders = async (senders: RTCRtpSender[], newTrack: MediaStreamTrack | null) => {
        await Promise.all(senders.map((s) => s.replaceTrack(newTrack).catch((err) => logger.warn(err))));
    };

    const stopAndRemoveTracks = (stream: MediaStream | null, kind: 'audio' | 'video') => {
        if (!stream) return;
        const tracks = kind === 'audio' ? stream.getAudioTracks() : stream.getVideoTracks();
        tracks.forEach((t) => {
            t.stop();
            stream.removeTrack(t);
        });
    };

    const toggleCamera = useCallback(
        async (videoSenders: RTCRtpSender[]) => {
            const stream = localStreamRef.current;

            if (camOn) {
                await replaceTrackForSenders(videoSenders, null);
                stopAndRemoveTracks(stream, 'video');
                setCamOn(false);
            } else {
                try {
                    const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
                    const [videoTrack] = newStream.getVideoTracks();

                    if (!videoTrack) {
                        logger.error('No video track available');
                        return;
                    }

                    const base = localStreamRef.current ?? new MediaStream();
                    localStreamRef.current = base;
                    base.addTrack(videoTrack);

                    await replaceTrackForSenders(videoSenders, videoTrack);
                    setCamOn(true);
                } catch (error) {
                    logger.error('Error enabling camera:', error);
                }
            }
        },
        [camOn],
    );

    const toggleMicrophone = useCallback(
        async (audioSenders: RTCRtpSender[]) => {
            const stream = localStreamRef.current;

            if (micOn) {
                await replaceTrackForSenders(audioSenders, null);
                stopAndRemoveTracks(stream, 'audio');
                setMicOn(false);
            } else {
                try {
                    const newStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    const [audioTrack] = newStream.getAudioTracks();

                    if (!audioTrack) {
                        logger.error('No audio track available');
                        return;
                    }

                    const base = localStreamRef.current ?? new MediaStream();
                    localStreamRef.current = base;
                    base.addTrack(audioTrack);

                    await replaceTrackForSenders(audioSenders, audioTrack);
                    setMicOn(true);
                } catch (error) {
                    logger.error('Error enabling microphone:', error);
                }
            }
        },
        [micOn],
    );

    const toggleScreenShare = useCallback(
        async (videoSenders: RTCRtpSender[]) => {
            if (screenOn) {
                await replaceTrackForSenders(videoSenders, null);
                stopAndRemoveTracks(localStreamRef.current, 'video');
                setScreenOn(false);

                if (camOn) {
                    try {
                        const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
                        const [videoTrack] = newStream.getVideoTracks();

                        if (videoTrack) {
                            localStreamRef.current?.addTrack(videoTrack);
                            await replaceTrackForSenders(videoSenders, videoTrack);
                        }
                    } catch (error) {
                        logger.error('Error re-enabling camera:', error);
                    }
                }
            } else {
                try {
                    const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                    const [screenTrack] = screenStream.getVideoTracks();

                    if (!screenTrack) return;

                    stopAndRemoveTracks(localStreamRef.current, 'video');

                    const base = localStreamRef.current ?? new MediaStream();
                    localStreamRef.current = base;
                    base.addTrack(screenTrack);

                    await replaceTrackForSenders(videoSenders, screenTrack);
                    setScreenOn(true);

                    screenTrack.onended = async () => {
                        await toggleScreenShare(videoSenders);
                    };
                } catch (error) {
                    logger.error('Screen sharing failed:', error);
                }
            }
        },
        [screenOn, camOn],
    );

    const stopAllTracks = () => {
        localStreamRef.current?.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
        setLocalStream(null);
    };

    return {
        localStream,
        localStreamRef,
        setLocalStream,
        camOn,
        micOn,
        screenOn,
        setCamOn,
        setMicOn,

        getUserMedia,
        toggleCamera,
        toggleMicrophone,
        toggleScreenShare,
        stopAllTracks,
    };
}
