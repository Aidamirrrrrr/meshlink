import { Maximize2, Mic, MicOff, MonitorSpeaker, MonitorUp, PhoneOff, Users, Video, VideoOff } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useMeshCall } from '../features/webrtc/hooks';
import { Button, Separator, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../shared/components';
import { WEBRTC_CONSTANTS } from '../shared/constants/webrtc';
import { env } from '../shared/lib/env';
import { createLogger } from '../shared/lib/logger';

const logger = createLogger('HomePage');

export default function HomePage() {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const localVideo = useRef<HTMLVideoElement>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);

    const {
        remoteStreams,
        remoteCamStatus,
        remoteMicStatus,
        remoteScreenStatus,
        started,
        micOn,
        camOn,
        screenOn,
        start,
        hangup,
        toggleMic,
        toggleCam,
        toggleScreen,
    } = useMeshCall({
        signalingUrl: env.VITE_SIGNALING_URL,
    });

    const totalParticipants = useMemo(() => Object.keys(remoteStreams).length + (started ? 1 : 0), [remoteStreams, started]);

    const gridLayout = useMemo(() => {
        if (totalParticipants <= 1) return 'grid-cols-1';
        if (totalParticipants === 2) return 'grid-cols-1 lg:grid-cols-2';
        if (totalParticipants <= 4) return 'grid-cols-2 lg:grid-cols-2';
        if (totalParticipants <= 6) return 'grid-cols-2 lg:grid-cols-3';
        return 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    }, [totalParticipants]);

    const handleHangup = useCallback(() => {
        hangup();
        if (localVideo.current) {
            try {
                localVideo.current.srcObject = null;
                localVideo.current.load();
            } catch (e: unknown) {
                logger.error('Error cleaning up local video:', e);
            }
        }
        setLocalStream(null);
        void navigate('/');
    }, [hangup, navigate]);

    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (started) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [started]);

    useEffect(() => {
        if (localVideo.current && localVideo.current.srcObject instanceof MediaStream) {
            setLocalStream(localVideo.current.srcObject);
        }
        if (!camOn) {
            if (localVideo.current && !localVideo.current.srcObject) setLocalStream(null);
        }
    }, [started, camOn]);

    const hasStartedRef = useRef(false);

    const handleStart = useCallback(async () => {
        if (!roomId || !localVideo.current || started || hasStartedRef.current) return;

        hasStartedRef.current = true;
        try {
            await start(roomId, localVideo.current);
            const ms = localVideo.current?.srcObject;
            if (ms instanceof MediaStream) setLocalStream(ms);
        } catch (error) {
            logger.error('Failed to start call:', error);
            hasStartedRef.current = false;
        }
    }, [roomId, started, start]);

    useEffect(() => {
        if (roomId && localVideo.current && !started && !hasStartedRef.current) {
            const timer = setTimeout(handleStart, WEBRTC_CONSTANTS.AUTO_START_DELAY_MS);
            return () => clearTimeout(timer);
        }
    }, [roomId, started, handleStart]);

    return (
        <TooltipProvider>
            <div className="h-screen w-full bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 px-4 pb-[100px] pt-[20px] overflow-hidden flex flex-col">
                <main className="mx-auto max-w-[1400px] flex-1 flex flex-col w-full">
                    <div className="relative rounded-3xl bg-zinc-200 dark:bg-zinc-900 p-3 sm:p-4 lg:p-6 shadow-sm flex-1 flex flex-col">
                        <div className={'grid gap-3 sm:gap-4 lg:gap-6 flex-1 ' + gridLayout}>
                            {started && (
                                <VideoTile
                                    stream={localStream || new MediaStream()}
                                    label="You"
                                    muted
                                    camOn={camOn && !screenOn}
                                    micOn={micOn}
                                    isScreenSharing={screenOn}
                                />
                            )}
                            {Object.entries(remoteStreams).map(([peerId, stream]) => (
                                <VideoTile
                                    key={peerId}
                                    stream={stream}
                                    label={peerId.slice(0, 6)}
                                    camOn={remoteCamStatus[peerId] ?? true}
                                    micOn={remoteMicStatus[peerId] ?? true}
                                    isScreenSharing={remoteScreenStatus[peerId] ?? false}
                                />
                            ))}
                            {!started && Object.keys(remoteStreams).length === 0 && (
                                <div className="col-span-full flex items-center justify-center h-auto py-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-dashed border-zinc-300 dark:border-zinc-700">
                                    <div className="text-center space-y-3">
                                        <p className="text-lg text-zinc-600 dark:text-zinc-400">No participants yet</p>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-500">Share the room ID to invite others</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <video ref={localVideo} autoPlay muted playsInline className="hidden" />
                    </div>
                </main>

                <footer className="fixed inset-x-0 bottom-0 z-30">
                    <div className="mx-auto max-w-7xl px-4 pb-5">
                        <div className="mx-auto w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg px-2 sm:px-3 py-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={micOn ? 'secondary' : 'destructive'}
                                        size="icon"
                                        className="rounded-full"
                                        onClick={toggleMic}
                                    >
                                        {micOn ? <Mic className="size-5" /> : <MicOff className="size-5" />}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>{micOn ? 'Mute' : 'Unmute'}</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={camOn && !screenOn ? 'secondary' : 'destructive'}
                                        size="icon"
                                        className="rounded-full"
                                        onClick={toggleCam}
                                        disabled={screenOn}
                                    >
                                        {camOn && !screenOn ? <Video className="size-5" /> : <VideoOff className="size-5" />}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {screenOn ? 'Camera disabled during screen sharing' : camOn ? 'Turn camera off' : 'Turn camera on'}
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={screenOn ? 'default' : 'secondary'}
                                        size="icon"
                                        className="rounded-full"
                                        onClick={toggleScreen}
                                        disabled={!started}
                                    >
                                        <MonitorUp className="size-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>{screenOn ? 'Stop sharing screen' : 'Share screen'}</TooltipContent>
                            </Tooltip>

                            <Separator orientation="vertical" className="h-6" />

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="rounded-full"
                                        onClick={handleHangup}
                                        disabled={!started}
                                    >
                                        <PhoneOff className="size-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Leave call</TooltipContent>
                            </Tooltip>

                            <Separator orientation="vertical" className="h-6" />

                            <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                                <Users className="size-4" />
                                <span>{totalParticipants} active</span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </TooltipProvider>
    );
}

const VideoTile = ({
    stream,
    label,
    muted = false,
    camOn = true,
    micOn = true,
    isScreenSharing = false,
}: {
    stream: MediaStream;
    label: string;
    muted?: boolean;
    camOn?: boolean;
    micOn?: boolean;
    isScreenSharing?: boolean;
}) => {
    const ref = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const toggleFullscreen = async () => {
        if (!containerRef.current) return;

        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
            } else {
                await containerRef.current.requestFullscreen();
            }
        } catch (error) {
            logger.error('Fullscreen toggle failed:', error);
        }
    };

    useEffect(() => {
        if (ref.current) {
            ref.current.srcObject = stream.getTracks().length > 0 ? stream : null;
        }
    }, [stream]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && document.fullscreenElement) {
                document.exitFullscreen().catch((err) => logger.error(err));
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div
            ref={containerRef}
            className={`group relative rounded-2xl overflow-hidden w-full transition-all duration-200 max-h-[85vh] ${
                camOn && stream.getTracks().length > 0 ? 'bg-black' : 'bg-zinc-900'
            }`}
        >
            <video
                ref={ref}
                autoPlay
                playsInline
                muted={muted}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${camOn && stream.getTracks().length > 0 ? 'opacity-100' : 'opacity-0'}`}
                style={{
                    transform: camOn && !isScreenSharing ? 'scaleX(-1)' : 'none',
                }}
            />
            {(!camOn || stream.getTracks().length === 0) && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-zinc-400 text-sm font-medium">
                        {stream.getTracks().length === 0 ? 'Connecting...' : 'Camera off'}
                    </div>
                </div>
            )}
            <div className="absolute left-2 bottom-2 flex items-center gap-1 text-[10px] sm:text-xs bg-black/60 text-white px-2 py-0.5 rounded">
                {isScreenSharing && <MonitorSpeaker className="size-3" />}
                {micOn ? <Mic className="size-3" /> : <MicOff className="size-3" />}
                <span>{label}</span>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 size-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/60 hover:bg-black/80 text-white border-0"
                onClick={toggleFullscreen}
            >
                <Maximize2 className="size-4" />
            </Button>
        </div>
    );
};
