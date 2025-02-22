import React from 'react';

interface TranscriptDisplayProps {
  transcript: string;
}

export function TranscriptDisplay({ transcript }: TranscriptDisplayProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow overflow-y-auto max-h-60">
      {transcript ? transcript : "Waiting for speech..."}
    </div>
  );
}
