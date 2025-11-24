import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/retroui/Button';
import { Input } from '@/components/retroui/Input';
import { Card, CardHeader, CardTitle } from '@/components/retroui/Card';
import type { Recording } from '@/types';
import { searchSongs } from '@/utils/musicbrainz';
import { fetchAlbumArt, loadAlbumArtCache, saveAlbumArtCache } from '@/utils/albumArt';
import { SongCard } from './SongCard';

interface SearchSectionProps {
  onAddToPlaylist: (song: Recording) => void;
}

export const SearchSection: React.FC<SearchSectionProps> = ({ onAddToPlaylist }) => {
  const [songName, setSongName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [albumName, setAlbumName] = useState('');
  const [searchResults, setSearchResults] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(false);
  const [albumArtCache, setAlbumArtCache] = useState<Record<string, string>>(loadAlbumArtCache);
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const resultsPerPage = 10;

  useEffect(() => {
    saveAlbumArtCache(albumArtCache);
  }, [albumArtCache]);

  const handleSearch = async (page: number = 1) => {
    if (!songName.trim() && !artistName.trim() && !albumName.trim()) return;
    
    setLoading(true);
    try {
      const { recordings, totalResults: total } = await searchSongs({
        songName,
        artistName,
        albumName,
        page,
        limit: resultsPerPage,
      });
      
      setSearchResults(recordings);
      setTotalResults(total);
      setCurrentPage(page);
      setLoading(false);
      
      // Fetch album art for each recording
      const recordingsToFetch = recordings.filter(
        (recording: Recording) => recording.releases?.[0]?.id && !albumArtCache[recording.id]
      );
      
      const loadingState: Record<string, boolean> = {};
      recordingsToFetch.forEach((recording: Recording) => {
        loadingState[recording.id] = true;
      });
      setLoadingImages(loadingState);
      
      recordingsToFetch.forEach(async (recording: Recording) => {
        try {
          const albumArt = await fetchAlbumArt(recording.releases![0].id);
          if (albumArt) {
            setAlbumArtCache(prev => ({ ...prev, [recording.id]: albumArt }));
          }
          setLoadingImages(prev => ({ ...prev, [recording.id]: false }));
        } catch (error) {
          console.error(`Failed to fetch album art for ${recording.id}:`, error);
          setLoadingImages(prev => ({ ...prev, [recording.id]: false }));
        }
      });
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setTotalResults(0);
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(1);
    }
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(totalResults / resultsPerPage);
    if (currentPage < totalPages) {
      handleSearch(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handleSearch(currentPage - 1);
    }
  };

  return (
    <Card className="p-6">
      <CardHeader className="p-0 mb-6">
        <CardTitle>Search Songs</CardTitle>
      </CardHeader>
      
      <div className="mb-6 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Song Name</label>
            <Input
              type="text"
              value={songName}
              onChange={(e) => setSongName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter song name..."
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Artist Name</label>
            <Input
              type="text"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter artist name..."
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Album Name</label>
            <Input
              type="text"
              value={albumName}
              onChange={(e) => setAlbumName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter album name..."
              className="w-full"
            />
          </div>
        </div>
        <Button
          onClick={() => handleSearch(1)}
          disabled={loading || (!songName.trim() && !artistName.trim() && !albumName.trim())}
          size="md"
          className="gap-2 w-full md:w-auto"
        >
          <Search className="w-5 h-5" />
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {/* Search Results */}
      <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
        {searchResults.length > 0 ? (
          searchResults.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              albumArt={albumArtCache[song.id]}
              isLoading={loadingImages[song.id]}
              onAdd={onAddToPlaylist}
            />
          ))
        ) : (songName || artistName || albumName) ? (
          <p className="text-muted-foreground text-center py-8">No songs found. Try another search!</p>
        ) : (
          <p className="text-muted-foreground text-center py-8">Enter a song name, artist, or album to get started</p>
        )}
      </div>

      {/* Pagination */}
      {searchResults.length > 0 && totalResults > resultsPerPage && (
        <div className="flex items-center justify-between border-t-2 border-border pt-4">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * resultsPerPage) + 1} - {Math.min(currentPage * resultsPerPage, totalResults)} of {totalResults} results
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || loading}
              size="sm"
              variant="outline"
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              onClick={handleNextPage}
              disabled={currentPage >= Math.ceil(totalResults / resultsPerPage) || loading}
              size="sm"
              variant="outline"
              className="gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

