import React from 'react';
import { Music, Trash2 } from 'lucide-react';
import { Card } from '@/components/retroui/Card';
import { Button } from '@/components/retroui/Button';
import type { PlaylistItem } from '@/types';

interface PlaylistItemCardProps {
  song: PlaylistItem;
  onRemove?: (id: string) => void;
  showIndex?: number;
  variant?: 'default' | 'compact';
}

export const PlaylistItemCard: React.FC<PlaylistItemCardProps> = ({ 
  song, 
  onRemove, 
  showIndex,
  variant = 'default' 
}) => {
  const cardClassName = variant === 'compact' ? 'p-3 bg-accent' : 'p-3';
  
  return (
    <Card className={cardClassName}>
      <div className="flex items-start gap-2">
        {showIndex !== undefined && (
          <span className="text-muted-foreground font-semibold text-sm w-6">{showIndex}.</span>
        )}
        {song.albumArt ? (
          <img
            src={song.albumArt}
            alt={`${song.title} album art`}
            className="w-12 h-12 object-cover border-2 border-border shadow-sm flex-shrink-0"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-12 h-12 bg-muted border-2 border-border flex items-center justify-center flex-shrink-0">
            <Music className="w-6 h-6 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-foreground font-semibold text-sm truncate font-head">{song.title}</h4>
          <p className="text-muted-foreground text-xs truncate">{song.artist}</p>
          {variant === 'default' && (
            <p className="text-muted text-xs">{song.releaseDate}</p>
          )}
        </div>
        {onRemove && (
          <Button
            onClick={() => onRemove(song.id)}
            size="icon"
            variant="secondary"
            className="bg-destructive hover:bg-destructive text-destructive-foreground border-destructive p-1 flex-shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </Card>
  );
};

