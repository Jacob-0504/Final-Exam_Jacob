import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Song } from './types';
import { SONG_LIST } from './constants';
import SongList from './components/SongList';
import PlayerControls from './components/PlayerControls';
import Visualizer from './components/Visualizer';
import AiMoodModal from './components/AiMoodModal';
import { audioEffects } from './services/audioEffects';
import { Sparkles, Disc, Music, AlertCircle, ArrowLeft } from 'lucide-react';

const GroovePlayer: React.FC = () => {
  const navigate = useNavigate();
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // AI Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Notification State
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // Stop music when component unmounts
  // Stop music when component unmounts - handled by ReactPlayer now
  // useEffect(() => {
  //   return () => {
  //     musicSynth.stop();
  //   };
  // }, []);

  // Handle Playback State
  // ReactPlayer handles playback via 'playing' prop, so we don't need this effect anymore for synthesis
  // useEffect(() => {
  //   if (currentSong && isPlaying) {
  //       musicSynth.play(currentSong.genre);
  //   } else {
  //       musicSynth.stop();
  //   }
  // }, [currentSong, isPlaying]);

  const handleSelectSong = (song: Song) => {
    audioEffects.playClick();
    if (currentSong?.id === song.id) {
      // Toggle play
      setIsPlaying(!isPlaying);
    } else {
      // New song
      setCurrentSong(song);
      setIsPlaying(true);
      setNotification({ message: `Playing ${song.title} now...`, type: 'success' });
    }
  };

  const handlePlayPause = () => {
    if (!currentSong && SONG_LIST.length > 0) {
      setCurrentSong(SONG_LIST[0]);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleNext = () => {
    if (!currentSong && SONG_LIST.length > 0) {
      setCurrentSong(SONG_LIST[0]);
      setIsPlaying(true);
      return;
    }
    if (!currentSong) return;

    const currentIndex = SONG_LIST.findIndex(s => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % SONG_LIST.length;
    setCurrentSong(SONG_LIST[nextIndex]);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    if (!currentSong) return;
    const currentIndex = SONG_LIST.findIndex(s => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + SONG_LIST.length) % SONG_LIST.length;
    setCurrentSong(SONG_LIST[prevIndex]);
    setIsPlaying(true);
  };

  const handleAiRecommendation = async (mood: string) => {
    setIsAnalyzing(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash-lite" });

      const prompt = `
        You are a DJ for teenagers. 
        
        Playlist Data: 
        ${JSON.stringify(SONG_LIST.map(s => ({ id: s.id, title: s.title, genre: s.genre })))}
        
        User Mood: "${mood}"
        
        Task:
        1. Select the BEST song ID from the playlist that matches the mood.
        2. Write a short, minimal 1-sentence supportive message in Korean.
        
        Output format:
        Strict JSON only. No markdown code blocks.
        Example: { "songId": 1, "message": "힘내세요!" }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      if (!responseText) throw new Error("No response from AI");

      const data = JSON.parse(responseText || "{}");

      const recommendedSong = SONG_LIST.find(s => s.id === data.songId);

      if (recommendedSong) {
        setCurrentSong(recommendedSong);
        setIsPlaying(true);
        setNotification({ message: data.message, type: 'success' });
        setIsAiModalOpen(false);
      }
    } catch (error) {
      console.error("AI Error:", error);
      setNotification({ message: "AI DJ가 잠시 쉬고 있어요. 다시 시도해주세요!", type: 'error' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isSpeedcore = currentSong?.genre === 'Speedcore';

  return (
    <div className="relative min-h-screen bg-slate-900 text-white flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden">
      {/* Hidden YouTube Player */}
      {currentSong && (
        <div className="hidden">
          <ReactPlayer
            playing={isPlaying}
            onEnded={handleNext}
            width="0"
            height="0"
            controls={false}
          />
        </div>
      )}

      <Visualizer isPlaying={isPlaying} isFast={isSpeedcore} />

      {/* Header */}
      <header className="relative z-10 p-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
            Groove
          </h1>
          <p className="text-slate-400 text-sm">Real AI Music Player</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              audioEffects.playClick();
              navigate('/');
            }}
            className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </button>
          <button
            onClick={() => {
              audioEffects.playClick();
              setIsAiModalOpen(true);
            }}
            className="w-10 h-10 rounded-full bg-violet-600/20 flex items-center justify-center border border-violet-500/50 hover:bg-violet-600/40 transition-colors animate-pulse"
          >
            <Sparkles className="w-5 h-5 text-violet-300" />
          </button>
        </div>
      </header>

      {/* Notification Banner */}
      {notification && (
        <div className={`
          relative z-10 mx-4 mb-2 p-3 backdrop-blur-md rounded-xl text-sm font-medium flex items-center gap-2 animate-[slideDown_0.3s_ease-out]
          ${notification.type === 'error' ? 'bg-red-500/90 text-white' : 'bg-gradient-to-r from-violet-600/90 to-indigo-600/90'}
        `}>
          {notification.type === 'success' ? (
            <Sparkles className="w-4 h-4 text-yellow-300 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-white flex-shrink-0 animate-bounce" />
          )}
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-auto text-white/50 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {/* Album Art / Visualizer Area */}
      <div className="relative w-full aspect-square max-h-[350px] p-8 flex items-center justify-center z-10">
        {currentSong ? (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Spinning Disc Effect */}
            <div className={`
               relative w-64 h-64 rounded-full shadow-2xl overflow-hidden border-4 border-slate-800
               ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}
             `}>
              {/* Album Cover */}
              <img
                src={currentSong.coverUrl}
                alt="Album Cover"
                className="w-full h-full object-cover opacity-80"
              />
              {/* Vinyl Center Hole */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-black rounded-full border-4 border-slate-700 flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
            </div>

            {/* Play Status Text */}
            {isPlaying && (
              <div className="absolute bottom-0 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs font-mono text-green-400 animate-pulse border border-green-500/30">
                PLAYING REAL MUSIC...
              </div>
            )}
          </div>
        ) : (
          <div className="w-64 h-64 rounded-full bg-slate-800/50 border-4 border-slate-700/50 flex flex-col items-center justify-center text-slate-500">
            <Music className="w-16 h-16 mb-2 opacity-50" />
            <p className="text-sm font-medium">노래를 선택하세요</p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col overflow-hidden">
        <SongList
          songs={SONG_LIST}
          currentSong={currentSong}
          isPlaying={isPlaying}
          onSelectSong={handleSelectSong}
        />
      </main>

      {/* Footer / Controls */}
      <PlayerControls
        currentSong={currentSong}
        isPlaying={isPlaying}
        isFast={isSpeedcore}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrev={handlePrev}
      />

      <AiMoodModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onRecommend={handleAiRecommendation}
        isAnalyzing={isAnalyzing}
      />
    </div>
  );
};

export default GroovePlayer;