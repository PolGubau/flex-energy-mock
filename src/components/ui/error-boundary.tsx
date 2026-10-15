import { AlertTriangle, RefreshCw } from "lucide-react";
import type { ErrorInfo, ReactNode } from "react";
import React from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}


export class ErrorBoundary extends (React.Component as typeof React.Component) {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { hasError, error } = this.state as State;
    const { fallback, children } = this.props as Props;

    if (hasError) {
      if (fallback) return fallback;
      return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="size-6 text-destructive" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-foreground">
              Something went wrong
            </p>
            <p className="text-xs text-muted-foreground max-w-xs">
              {(error as Error | null)?.message ??
                "An unexpected error occurred."}
            </p>
          </div>
          <button
            type="button"
            onClick={this.handleRetry}
            className="flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            <RefreshCw className="size-3.5" />
            Try again
          </button>
        </div>
      );
    }
    return children;
  }
}
