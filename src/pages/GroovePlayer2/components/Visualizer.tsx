import React from 'react';

interface VisualizerProps {
  isPlaying: boolean;
  isFast: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ isPlaying, isFast }) => {
  // Speedcore mode: much faster animations (0.5s duration)
  // Normal mode: slow ambient animations (3s - 5s duration)
  const durationClass1 = isFast ? 'duration-[500ms]' : 'duration-[3000ms]';
  const durationClass2 = isFast ? 'duration-[800ms]' : 'duration-[5000ms]';
  const pulseScale = isFast ? 'scale-125' : 'scale-110';

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Gradient Blob 1 */}
      <div 
        className={`
          absolute top-[-10%] left-[-10%] w-[500px] h-[500px] 
          bg-violet-600/20 rounded-full blur-[100px] transition-all ease-in-out
          ${durationClass1}
          ${isPlaying ? `${pulseScale} opacity-60 translate-x-10` : 'scale-100 opacity-30'}
        `}
      />
      {/* Gradient Blob 2 */}
      <div 
        className={`
          absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] 
          bg-indigo-600/20 rounded-full blur-[80px] transition-all ease-in-out
          ${durationClass2}
          ${isPlaying ? `${pulseScale} opacity-50 -translate-y-10` : 'scale-100 opacity-20'}
        `}
      />
    </div>
  );
};

export default Visualizer;