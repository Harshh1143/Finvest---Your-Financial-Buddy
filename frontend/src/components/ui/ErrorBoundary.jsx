import React from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { Button } from "./button";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught runtime error captured by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-brand-midnight text-brand-cream px-6 font-sans relative overflow-hidden">
          {/* Ambient background glows */}
          <div className="absolute w-[500px] h-[500px] rounded-full bg-brand-cobalt/5 blur-[120px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          
          <div className="max-w-md w-full text-center space-y-8 z-10 relative">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shadow-xl shadow-red-500/5 animate-pulse">
              <AlertCircle className="h-8 w-8 stroke-[1.5]" />
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl font-extrabold tracking-tight text-brand-cream">
                Workspace error encountered
              </h1>
              <p className="text-xs text-brand-silver leading-relaxed max-w-sm mx-auto">
                An unexpected exception occurred during the financial dashboard rendering cycle. We have isolated the issue to preserve session state integrity.
              </p>
            </div>

            {this.state.error && (
              <div className="rounded-xl border border-brand-cream/5 bg-brand-cream/5 p-4 text-left font-mono text-[10px] text-brand-silver max-h-36 overflow-y-auto custom-scrollbar leading-normal">
                <span className="font-bold text-red-400">Exception: </span>
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="w-full sm:w-auto rounded-lg bg-brand-cream text-brand-midnight hover:bg-brand-cream/90 font-bold px-6 py-4 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-cobalt/5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reload Workspace
              </Button>
              <Button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = "/";
                }}
                variant="secondary"
                className="w-full sm:w-auto rounded-lg border border-brand-cream/10 bg-brand-cream/5 text-brand-cream hover:bg-brand-cream/10 font-bold px-6 py-4 text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="h-3.5 w-3.5" />
                Return Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
