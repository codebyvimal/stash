import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    // Clear potentially corrupted local storage
    localStorage.removeItem('tally_data');
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center">
          <div className="max-w-md w-full glass-card p-8 rounded-3xl border border-white/10">
            <h1 className="text-2xl font-bold mb-3 text-rose-400">Oops! Something went wrong.</h1>
            <p className="text-slate-400 mb-8 leading-relaxed">
              We detected a data issue and have cleared your local cache to resolve it. Your saved data in the cloud is safe.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-colors shadow-lg shadow-blue-500/20"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
