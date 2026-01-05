import React, { useState } from 'react';
import { Sparkles, X, Loader2 } from 'lucide-react';
import { audioEffects } from '../services/audioEffects';

interface AiMoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecommend: (mood: string) => Promise<void>;
  isAnalyzing: boolean;
}

const AiMoodModal: React.FC<AiMoodModalProps> = ({ isOpen, onClose, onRecommend, isAnalyzing }) => {
  const [mood, setMood] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mood.trim()) {
      audioEffects.playClick();
      onRecommend(mood);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-slate-800 border border-violet-500/30 rounded-2xl w-full max-w-sm p-6 shadow-2xl transform transition-all animate-[fadeIn_0.3s_ease-out]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-violet-600/20 rounded-full flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6 text-violet-400 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-white">AI 무드 스캐너</h2>
          <p className="text-sm text-slate-400 text-center mt-1">
            지금 기분이 어때요?<br/>당신에게 딱 맞는 노래를 찾아드릴게요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            placeholder="예: 시험 망쳐서 우울해, 신나는 파티!"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            autoFocus
          />
          
          <button
            type="submit"
            disabled={isAnalyzing || !mood.trim()}
            className={`
              w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all
              ${isAnalyzing || !mood.trim()
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/25 active:scale-95'}
            `}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                분석 중...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                노래 추천 받기
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiMoodModal;