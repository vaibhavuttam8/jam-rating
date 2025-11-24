import React, { useState } from 'react';
import { Search, Plus, Trash2, Music, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/retroui/Input";
import { Card, CardHeader, CardTitle } from "@/components/retroui/Card";

interface Recording {
  id: string;
  title: string;
  'artist-credit'?: Array<{
    artist?: {
      name?: string;
    };
  }>;
  'first-release-date'?: string;
  releases?: Array<{
    id: string;
  }>;
}

interface PlaylistItem {
  id: string;
  title: string;
  artist: string;
  releaseDate: string;
  mbid: string;
  albumArt?: string;
}

export default function PlaylistApp() {
  const [songName, setSongName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [searchResults, setSearchResults] = useState<Recording[]>([]);
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [playlistName, setPlaylistName] = useState('My Playlist');
  const [editingName, setEditingName] = useState(false);
  const [albumArtCache, setAlbumArtCache] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const resultsPerPage = 10;

  const fetchAlbumArt = async (releaseId: string): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://coverartarchive.org/release/${releaseId}`
      );
      if (response.ok) {
        const data = await response.json();
        return data.images?.[0]?.thumbnails?.small || data.images?.[0]?.image || null;
      }
    } catch (error) {
      console.error('Album art fetch error:', error);
    }
    return null;
  };

  const searchSongs = async (page: number = 1) => {
    if (!songName.trim() && !artistName.trim()) return;
    setLoading(true);
    try {
      // Build the query based on what fields are filled
      const queryParts: string[] = [];
      
      if (songName.trim()) {
        queryParts.push(`recording:"${songName.trim()}"`);
      }
      
      if (artistName.trim()) {
        queryParts.push(`artist:"${artistName.trim()}"`);
      }
      
      const query = queryParts.join(' AND ');
      const offset = (page - 1) * resultsPerPage;
      
      const response = await fetch(
        `https://musicbrainz.org/ws/2/recording?query=${encodeURIComponent(query)}&limit=${resultsPerPage}&offset=${offset}&fmt=json`
      );
      const data = await response.json();
      const recordings = data.recordings || [];
      setSearchResults(recordings);
      setTotalResults(data.count || 0);
      setCurrentPage(page);
      
      // Fetch album art for each recording
      const artCache: Record<string, string> = { ...albumArtCache };
      for (const recording of recordings) {
        if (recording.releases?.[0]?.id && !artCache[recording.id]) {
          const albumArt = await fetchAlbumArt(recording.releases[0].id);
          if (albumArt) {
            artCache[recording.id] = albumArt;
          }
        }
      }
      setAlbumArtCache(artCache);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      searchSongs(1);
    }
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(totalResults / resultsPerPage);
    if (currentPage < totalPages) {
      searchSongs(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      searchSongs(currentPage - 1);
    }
  };

  const addToPlaylist = (song: Recording) => {
    const playlistItem: PlaylistItem = {
      id: `${song.id}-${Date.now()}`,
      title: song.title,
      artist: song['artist-credit']?.[0]?.artist?.name || 'Unknown Artist',
      releaseDate: song['first-release-date'] || 'N/A',
      mbid: song.id,
      albumArt: albumArtCache[song.id]
    };
    setPlaylist([...playlist, playlistItem]);
  };

  const removeFromPlaylist = (id: string) => {
    setPlaylist(playlist.filter(item => item.id !== id));
  };

  const clearPlaylist = () => {
    setPlaylist([]);
  };

  return (
    <div className="min-h-screen bg-background p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Music className="w-8 h-8 text-primary" strokeWidth={3} />
            <h1 className="text-4xl font-head font-bold text-foreground">Music Playlist</h1>
          </div>
          <p className="text-muted-foreground font-medium">Search for songs and build your custom playlist</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search Section */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <CardHeader className="p-0 mb-6">
                <CardTitle>Search Songs</CardTitle>
              </CardHeader>
              
              <div className="mb-6 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                </div>
                <Button
                  onClick={() => searchSongs(1)}
                  disabled={loading || (!songName.trim() && !artistName.trim())}
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
                    <Card
                      key={song.id}
                      className="p-4 flex gap-3 items-start hover:shadow-md transition-all"
                    >
                      {albumArtCache[song.id] ? (
                        <img
                          src={albumArtCache[song.id]}
                          alt={`${song.title} album art`}
                          className="w-16 h-16 object-cover border-2 border-border shadow-sm flex-shrink-0"
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
                        onClick={() => addToPlaylist(song)}
                        size="icon"
                        className="flex-shrink-0"
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                    </Card>
                  ))
                ) : (songName || artistName) ? (
                  <p className="text-muted-foreground text-center py-8">No songs found. Try another search!</p>
                ) : (
                  <p className="text-muted-foreground text-center py-8">Enter a song name or artist to get started</p>
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
          </div>

          {/* Playlist Section */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <div className="mb-4">
                {editingName ? (
                  <Input
                    type="text"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    onBlur={() => setEditingName(false)}
                    onKeyPress={(e) => e.key === 'Enter' && setEditingName(false)}
                    autoFocus
                    className="font-head text-2xl font-semibold"
                  />
                ) : (
                  <h2
                    onClick={() => setEditingName(true)}
                    className="text-2xl font-head font-semibold text-foreground cursor-pointer hover:text-primary transition"
                  >
                    {playlistName}
                  </h2>
                )}
              </div>

              <div className="flex gap-2 mb-4">
                <Button
                  onClick={clearPlaylist}
                  disabled={playlist.length === 0}
                  variant="secondary"
                  className="flex-1 bg-destructive hover:bg-destructive text-destructive-foreground border-destructive text-sm"
                >
                  Clear
                </Button>
              </div>

              <Card className="p-3 mb-4 bg-accent">
                <p className="text-accent-foreground font-semibold font-head">
                  {playlist.length} song{playlist.length !== 1 ? 's' : ''}
                </p>
              </Card>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {playlist.length > 0 ? (
                  playlist.map((song) => (
                    <Card key={song.id} className="p-3">
                      <div className="flex items-start gap-2">
                        {song.albumArt ? (
                          <img
                            src={song.albumArt}
                            alt={`${song.title} album art`}
                            className="w-12 h-12 object-cover border-2 border-border shadow-sm flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted border-2 border-border flex items-center justify-center flex-shrink-0">
                            <Music className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-foreground font-semibold text-sm truncate font-head">{song.title}</h4>
                          <p className="text-muted-foreground text-xs truncate">{song.artist}</p>
                          <p className="text-muted text-xs">{song.releaseDate}</p>
                        </div>
                        <Button
                          onClick={() => removeFromPlaylist(song.id)}
                          size="icon"
                          variant="secondary"
                          className="bg-destructive hover:bg-destructive text-destructive-foreground border-destructive p-1 flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8 text-sm">Add songs to your playlist</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

