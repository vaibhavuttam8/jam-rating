import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Recording, PlaylistItem } from '@/types';
import { mockAPI } from '@/api/mockAPI';
import { SearchSection } from '@/components/SearchSection';
import { PlaylistBuilder } from '@/components/PlaylistBuilder';

export const CreatePlaylistPage: React.FC = () => {
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const navigate = useNavigate();

  const handleAddToPlaylist = (song: Recording) => {
    // Get album art from cache if available
    let albumArt: string | undefined;
    try {
      const cached = localStorage.getItem('albumArtCache');
      if (cached) {
        const cache = JSON.parse(cached);
        albumArt = cache[song.id];
      }
    } catch {
      // Ignore cache errors
    }

    const playlistItem: PlaylistItem = {
      id: `${song.id}-${Date.now()}`,
      title: song.title,
      artist: song['artist-credit']?.[0]?.artist?.name || 'Unknown Artist',
      releaseDate: song['first-release-date'] || 'N/A',
      mbid: song.id,
      albumArt,
    };
    setPlaylist([...playlist, playlistItem]);
  };

  const handleRemoveFromPlaylist = (id: string) => {
    setPlaylist(playlist.filter(item => item.id !== id));
  };

  const handleClearPlaylist = () => {
    setPlaylist([]);
  };

  const handleCreatePlaylist = (name: string, description: string, coverImage?: string) => {
    mockAPI.createPlaylist({
      name,
      description,
      author: 'Anonymous User',
      songs: [...playlist],
      coverImage,
    });
    
    setPlaylist([]);
    navigate('/');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Search Section */}
      <div className="lg:col-span-2">
        <SearchSection onAddToPlaylist={handleAddToPlaylist} />
      </div>

      {/* Playlist Section */}
      <div className="lg:col-span-1">
        <PlaylistBuilder
          playlist={playlist}
          onRemoveFromPlaylist={handleRemoveFromPlaylist}
          onClearPlaylist={handleClearPlaylist}
          onCreatePlaylist={handleCreatePlaylist}
        />
      </div>
    </div>
  );
};

