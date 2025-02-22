import React from 'react';
import { cn } from '@/lib/utils';

interface CallControlsProps {
  isCallActive: boolean;
  onCallStart: () => void;
  onCallEnd: () => void;
  onFlag: () => void;
  isFlagged: boolean;
}

export function CallControls({
  isCallActive,
  onCallStart,
  onCallEnd,
  onFlag,
  isFlagged
}: CallControlsProps) {
  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Main call controls */}
      <div className="flex items-center justify-center space-x-8">
        {/* Mute button - placeholder for future functionality */}
        <button
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center",
            "bg-white/10 hover:bg-white/20 transition-colors",
            "text-white/80 hover:text-white"
          )}
          disabled={!isCallActive}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>

        {/* Answer/End Call button */}
        <button
          onClick={isCallActive ? onCallEnd : onCallStart}
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center",
            "transition-all duration-300 transform hover:scale-105",
            isCallActive
              ? "bg-red-500 hover:bg-red-600"
              : "bg-emerald-500 hover:bg-emerald-600"
          )}
        >
          {isCallActive ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          )}
        </button>

        {/* Flag as scam button */}
        <button
          onClick={onFlag}
          disabled={!isCallActive || isFlagged}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center transition-colors",
            isFlagged
              ? "bg-red-500/50 text-white cursor-not-allowed"
              : isCallActive
                ? "bg-white/10 hover:bg-red-500/50 text-white/80 hover:text-white"
                : "bg-white/10 text-white/40 cursor-not-allowed"
          )}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
          </svg>
        </button>
      </div>

      {/* Status text */}
      <div className="text-sm text-white/60">
        {isFlagged ? (
          <span className="text-red-400">Call flagged as potential scam</span>
        ) : isCallActive ? (
          <span>Tap the red button to end call</span>
        ) : (
          <span>Tap the green button to start</span>
        )}
      </div>
    </div>
  );
}
