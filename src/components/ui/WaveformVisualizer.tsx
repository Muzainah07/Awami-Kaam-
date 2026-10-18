import React from 'react';

interface WaveformVisualizerProps {
  isRecording?: boolean;
  audioLevel?: number; // 0 to 1
  barsCount?: number;
  color?: string;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  isRecording = false,
  audioLevel = 0.4,
  barsCount = 9,
  color = '#0B6B3A',
}) => {
  const baseHeights = [12, 24, 38, 20, 32, 44, 28, 16, 22];

  return (
    <div className="flex items-center justify-center gap-1.5 h-12 py-2">
      {Array.from({ length: barsCount }).map((_, i) => {
        const heightMultiplier = isRecording ? Math.max(0.2, audioLevel * 1.5) : 0.2;
        const targetHeight = Math.round((baseHeights[i % baseHeights.length] || 20) * heightMultiplier);

        return (
          <div
            key={i}
            className="w-1.5 rounded-full transition-all duration-100"
            style={{
              height: `${Math.max(6, targetHeight)}px`,
              backgroundColor: color,
            }}
          />
        );
      })}
    </div>
  );
};
