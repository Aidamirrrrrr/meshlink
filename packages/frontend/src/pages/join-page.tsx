import { Shuffle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Input, TooltipProvider } from '../shared/components';

const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export default function JoinPage() {
    const [roomId, setRoomId] = useState(generateRoomCode());
    const navigate = useNavigate();

    function handleJoin() {
        const trimmedRoomId = roomId.trim();
        if (trimmedRoomId) {
            void navigate(`/room/${trimmedRoomId}`);
        }
    }

    function handleGenerateNewCode() {
        setRoomId(generateRoomCode());
    }

    function handleKeyPress(e: React.KeyboardEvent) {
        if (e.key === 'Enter') {
            handleJoin();
        }
    }

    return (
        <TooltipProvider>
            <div className="min-h-screen w-full bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">MeshLink</h1>
                        <p className="text-zinc-600 dark:text-zinc-400">Join a video call room</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="roomId" className="text-sm font-medium">
                                Room ID
                            </label>
                            <div className="flex gap-2">
                                <Input
                                    id="roomId"
                                    value={roomId}
                                    onChange={(e) => setRoomId(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Enter room ID"
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={handleGenerateNewCode}
                                    title="Generate new room code"
                                >
                                    <Shuffle className="size-4" />
                                </Button>
                            </div>
                        </div>

                        <Button onClick={handleJoin} className="w-full">
                            Join Room
                        </Button>
                    </div>

                    <div className="text-center">
                        <p className="text-xs text-zinc-500 dark:text-zinc-500">Share the room ID with others to invite them</p>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
