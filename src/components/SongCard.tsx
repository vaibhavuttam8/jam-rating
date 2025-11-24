import React from 'react';
import { Music, Plus } from 'lucide-react';
import { Card } from '@/components/retroui/Card';
import { Button } from '@/components/retroui/Button';
import type { Recording } from '@/types';

interface SongCardProps {
  song: Recording;
  albumArt?: string;
  isLoading?: boolean;
  onAdd: (song: Recording) => void;
}

export const SongCard: React.FC<SongCardProps> = ({ song, albumArt, isLoading, onAdd }) => {
  return (
    <Card className="p-4 flex gap-3 items-start hover:shadow-md transition-all">
      {isLoading ? (
        <div className="w-16 h-16 bg-muted border-2 border-border flex items-center justify-center flex-shrink-0">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : albumArt ? (
        <img
          src={albumArt}
          alt={`${song.title} album art`}
          className="w-16 h-16 object-cover border-2 border-border shadow-sm flex-shrink-0"
          loading="eager"
          decoding="async"
        />
      ) : (
        <div className="w-16 h-16 bg-muted border-2 border-border flex items-center justify-center flex-shrink-0">
          <Music className="w-8 h-8 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="text-foreground font-semibold font-head truncate">{song.title}</h3>
        <p className="text-muted-foreground text-sm truncate">
          {song['artist-credit']?.[0]?.artist?.name || 'Unknown Artist'}
        </p>
        <p className="text-muted text-xs">
          {song['first-release-date'] ? song['first-release-date'].split('-')[0] : 'N/A'}
        </p>
      </div>
      <Button
        onClick={() => onAdd(song)}
        size="icon"
        className="flex-shrink-0"
      >
        <Plus className="w-5 h-5" />
      </Button>
    </Card>
  );
};

