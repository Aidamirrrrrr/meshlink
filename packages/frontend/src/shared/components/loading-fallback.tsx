import { Loader2 } from 'lucide-react';

export function LoadingFallback() {
    return (
        <div className="h-screen w-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-950">
            <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-zinc-900 dark:text-zinc-50 mx-auto mb-4" />
                <p className="text-lg text-zinc-700 dark:text-zinc-300">Loading...</p>
            </div>
        </div>
    );
}
