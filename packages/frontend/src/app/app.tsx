import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';

import { LoadingFallback } from '../shared/components';
import { ErrorBoundary } from '../shared/components/error-boundary';

const HomePage = lazy(() => import('../pages/home-page'));
const JoinPage = lazy(() => import('../pages/join-page'));

export function App() {
    return (
        <ErrorBoundary>
            <Toaster position="top-right" richColors closeButton />
            <Suspense fallback={<LoadingFallback />}>
                <Routes>
                    <Route path="/" element={<JoinPage />} />
                    <Route path="/room/:roomId" element={<HomePage />} />
                </Routes>
            </Suspense>
        </ErrorBoundary>
    );
}
