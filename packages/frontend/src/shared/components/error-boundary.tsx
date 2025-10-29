import { Component, type ErrorInfo, type ReactNode } from 'react';

import { logger } from '../lib/logger';
import { Button } from './ui/button';

interface Props {
    children: ReactNode;
    fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        logger.error('React Error Boundary caught an error:', error, errorInfo);

        this.setState({
            error,
            errorInfo,
        });
    }

    private handleReset = (): void => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    public render(): ReactNode {
        if (this.state.hasError && this.state.error) {
            if (this.props.fallback) {
                return this.props.fallback(this.state.error, this.handleReset);
            }

            return (
                <div className="min-h-screen w-full bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full space-y-6 text-center">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight">Oops! Something went wrong</h1>
                            <p className="text-zinc-600 dark:text-zinc-400">
                                We encountered an unexpected error. Please try reloading the page.
                            </p>
                        </div>

                        {import.meta.env.DEV && this.state.error && (
                            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-4 text-left">
                                <p className="font-mono text-sm text-red-800 dark:text-red-200 break-all">{this.state.error.message}</p>
                                {this.state.errorInfo && (
                                    <details className="mt-2">
                                        <summary className="cursor-pointer text-xs text-red-600 dark:text-red-400 font-medium">
                                            Stack trace
                                        </summary>
                                        <pre className="mt-2 text-xs text-red-700 dark:text-red-300 overflow-auto max-h-40">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        )}

                        <div className="flex gap-2 justify-center">
                            <Button onClick={() => window.location.reload()} variant="default">
                                Reload Page
                            </Button>
                            <Button onClick={this.handleReset} variant="outline">
                                Try Again
                            </Button>
                        </div>

                        <p className="text-xs text-zinc-500 dark:text-zinc-500">If this problem persists, please contact support.</p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
