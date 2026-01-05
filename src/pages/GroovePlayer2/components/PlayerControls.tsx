import React from 'react';
import { Song } from '../types';
import { Play, Pause, SkipBack, SkipForward, Music2, Zap } from 'lucide-react';
import { audioEffects } from '../services/audioEffects';

interface PlayerControlsProps {
  currentSong: Song | null;
  isPlaying: boolean;
  isFast: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({ 
  currentSong, 
  isPlaying, 
  isFast,
  onPlayPause, 
  onNext, 
  onPrev 
}) => {
  
  const handleButtonClick = (action: () => void) => {
    audioEffects.playClick();
    action();
  };

  if (!currentSong) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-t border-slate-700 p-6 flex justify-center items-center text-slate-500 z-50">
        <Music2 className="w-5 h-5 mr-2" />
        <span>재생할 노래를 선택해주세요</span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-violet-500/30 p-4 pb-8 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)] z-50">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        
        {/* Track Info (Mini) */}
        <div className="flex items-center w-1/3 overflow-hidden relative">
          <img 
            src={currentSong.coverUrl} 
            alt="cover" 
            className={`w-12 h-12 rounded-lg object-cover mr-3 shadow-lg ${isPlaying ? 'opacity-100' : 'opacity-70'}`}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-white font-medium truncate text-sm">{currentSong.title}</h4>
            </div>
            <p className="text-slate-400 text-xs truncate">{currentSong.artist}</p>
            {isFast && (
              <span className="inline-flex items-center text-[10px] font-bold text-yellow-400 mt-0.5 animate-pulse">
                <Zap className="w-3 h-3 mr-0.5 fill-current" />
                1.25x SPEED
              </span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-6 w-1/3">
          <button 
            onClick={() => handleButtonClick(onPrev)}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
          >
            <SkipBack className="w-6 h-6" />
          </button>
          
          <button 
            onClick={() => handleButtonClick(onPlayPause)}
            className={`
              w-14 h-14 flex items-center justify-center rounded-full shadow-lg transform active:scale-95 transition-all
              ${isFast 
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/40' 
                : 'bg-violet-600 hover:bg-violet-500 shadow-violet-600/40'}
            `}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current text-white" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-1 text-white" />
            )}
          </button>
          
          <button 
            onClick={() => handleButtonClick(onNext)}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
          >
            <SkipForward className="w-6 h-6" />
          </button>
        </div>

        {/* Visualizer Bars */}
        <div className="w-1/3 flex justify-end">
          <div className="flex items-end space-x-1 h-8">
            {[...Array(4)].map((_, i) => (
              <div 
                key={i}
                className={`w-1 rounded-t-sm transition-all duration-300 
                  ${isFast ? 'bg-rose-400' : 'bg-violet-400'} 
                  ${isPlaying ? 'animate-pulse' : 'h-1'}`}
                style={{ 
                  height: isPlaying ? `${Math.random() * 80 + 20}%` : '4px',
                  animationDelay: `${i * 0.1}s`,
                  transitionDuration: isFast ? '50ms' : '300ms'
                }} 
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PlayerControls;