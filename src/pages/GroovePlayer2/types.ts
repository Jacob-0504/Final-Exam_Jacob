export interface Song {
  id: number;
  title: string;
  artist: string;
  coverUrl: string;
  duration: string;
  genre: 'Electronic' | 'Dubstep' | 'Speedcore' | 'Lo-Fi' | 'Synthwave' | 'Drum&Bass' | 'K-Pop' | 'Rock';
  isTrending?: boolean;
}

export interface AudioContextType {
  playClickSound: () => void;
}