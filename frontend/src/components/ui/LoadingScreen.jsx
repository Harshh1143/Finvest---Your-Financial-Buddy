import * as React from "react";

export const LoadingScreen = React.memo(() => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-midnight relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute w-60 h-60 rounded-full bg-brand-cobalt/10 blur-[100px] animate-pulse" />
      
      <div className="flex flex-col items-center gap-4 z-10">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-cobalt border-t-transparent" />
        <span className="text-[10px] font-bold tracking-[0.3em] text-brand-silver uppercase mt-4 font-mono">
          Synchronizing Workspace...
        </span>
      </div>
    </div>
  );
});

LoadingScreen.displayName = "LoadingScreen";
