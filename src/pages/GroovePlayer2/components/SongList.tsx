import React from 'react';
import { Song } from '../types';
import { Play, BarChart2, Flame } from 'lucide-react';

interface SongListProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onSelectSong: (song: Song) => void;
}

const getGenreColor = (genre: string) => {
  switch (genre) {
    case 'K-Pop': return 'bg-pink-500/20 text-pink-300 border-pink-500/30';
    case 'Rock': return 'bg-red-500/20 text-red-300 border-red-500/30';
    case 'Speedcore': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    case 'Dubstep': return 'bg-lime-500/20 text-lime-300 border-lime-500/30';
    case 'Lo-Fi': return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
    case 'Drum&Bass': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    default: return 'bg-violet-500/20 text-violet-300 border-violet-500/30';
  }
};

const SongList: React.FC<SongListProps> = ({ songs, currentSong, isPlaying, onSelectSong }) => {
  return (
    <div className="flex-1 overflow-y-auto pb-32 px-4">
      <h2 className="text-2xl font-bold mb-6 mt-4 flex items-center gap-2 text-violet-400">
        <span>인기 차트 Top 100</span>
        <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
      </h2>
      <div className="space-y-3">
        {songs.map((song, index) => {
          const isActive = currentSong?.id === song.id;
          
          return (
            <div
              key={song.id}
              onClick={() => onSelectSong(song)}
              className={`
                group flex items-center p-3 rounded-xl cursor-pointer transition-all duration-300
                ${isActive 
                  ? 'bg-violet-600/20 border border-violet-500/50' 
                  : 'bg-slate-800 hover:bg-slate-700 hover:translate-x-1 border border-transparent'}
              `}
            >
              {/* Rank Number */}
              <span className={`w-6 text-center font-bold text-lg mr-2 italic ${index < 3 ? 'text-yellow-400' : 'text-slate-600'}`}>
                {index + 1}
              </span>

              {/* Cover Image */}
              <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 mr-4 shadow-lg group-hover:shadow-violet-500/20 transition-shadow">
                <img 
                  src={song.coverUrl} 
                  alt={song.title} 
                  className="w-full h-full object-cover"
                />
                {isActive && isPlaying && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <BarChart2 className="w-6 h-6 text-violet-400 animate-pulse" />
                  </div>
                )}
                {!isActive && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>

              {/* Song Info */}
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold truncate text-base ${isActive ? 'text-violet-300' : 'text-white'}`}>
                    {song.title}
                  </h3>
                  {song.isTrending && (
                    <div className="flex items-center text-[10px] text-orange-400 font-bold bg-orange-900/30 px-1.5 py-0.5 rounded ml-2 flex-shrink-0">
                      <Flame className="w-3 h-3 mr-0.5 fill-current" />
                      HOT
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getGenreColor(song.genre)}`}>
                    {song.genre}
                  </span>
                  <p className="text-sm text-slate-400 truncate">{song.artist}</p>
                </div>
              </div>

              {/* Duration */}
              <div className="text-sm text-slate-500 ml-3 font-mono hidden sm:block">
                {song.duration}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SongList;