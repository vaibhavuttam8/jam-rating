import React, { useState } from 'react';
import { Search, Plus, Trash2, Music, ChevronLeft, ChevronRight, ThumbsUp, ThumbsDown, MessageCircle, Send } from 'lucide-react';
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

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: Date;
}

interface PlaylistPost {
  id: string;
  name: string;
  description: string;
  author: string;
  songs: PlaylistItem[];
  upvotes: number;
  downvotes: number;
  comments: Comment[];
  createdAt: Date;
  userVote?: 'up' | 'down' | null;
}

// Mock API functions
const mockAPI = {
  playlists: [] as PlaylistPost[],
  
  createPlaylist: (playlist: Omit<PlaylistPost, 'id' | 'createdAt' | 'upvotes' | 'downvotes' | 'comments' | 'userVote'>): PlaylistPost => {
    const newPlaylist: PlaylistPost = {
      ...playlist,
      id: `playlist-${Date.now()}`,
      upvotes: 0,
      downvotes: 0,
      comments: [],
      createdAt: new Date(),
      userVote: null,
    };
    mockAPI.playlists.unshift(newPlaylist);
    return newPlaylist;
  },
  
  getAllPlaylists: (): PlaylistPost[] => {
    return mockAPI.playlists;
  },
  
  upvotePlaylist: (playlistId: string): PlaylistPost | null => {
    const playlist = mockAPI.playlists.find(p => p.id === playlistId);
    if (!playlist) return null;
    
    if (playlist.userVote === 'up') {
      playlist.upvotes--;
      playlist.userVote = null;
    } else {
      if (playlist.userVote === 'down') {
        playlist.downvotes--;
      }
      playlist.upvotes++;
      playlist.userVote = 'up';
    }
    return playlist;
  },
  
  downvotePlaylist: (playlistId: string): PlaylistPost | null => {
    const playlist = mockAPI.playlists.find(p => p.id === playlistId);
    if (!playlist) return null;
    
    if (playlist.userVote === 'down') {
      playlist.downvotes--;
      playlist.userVote = null;
    } else {
      if (playlist.userVote === 'up') {
        playlist.upvotes--;
      }
      playlist.downvotes++;
      playlist.userVote = 'down';
    }
    return playlist;
  },
  
  addComment: (playlistId: string, author: string, text: string): Comment | null => {
    const playlist = mockAPI.playlists.find(p => p.id === playlistId);
    if (!playlist) return null;
    
    const comment: Comment = {
      id: `comment-${Date.now()}`,
      author,
      text,
      timestamp: new Date(),
    };
    playlist.comments.push(comment);
    return comment;
  },
};

export default function PlaylistApp() {
  const [songName, setSongName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [albumName, setAlbumName] = useState('');
  const [searchResults, setSearchResults] = useState<Recording[]>([]);
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [playlistName, setPlaylistName] = useState('My Playlist');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [albumArtCache, setAlbumArtCache] = useState<Record<string, string>>(() => {
    // Initialize from localStorage for instant loading
    try {
      const cached = localStorage.getItem('albumArtCache');
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const resultsPerPage = 10;
  
  // New state for playlist posts
  const [playlistPosts, setPlaylistPosts] = useState<PlaylistPost[]>([]);
  const [currentView, setCurrentView] = useState<'create' | 'feed'>('create');
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});

  // Persist album art cache to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('albumArtCache', JSON.stringify(albumArtCache));
    } catch (error) {
      console.error('Failed to save cache:', error);
    }
  }, [albumArtCache]);

  const fetchAlbumArt = async (releaseId: string, recordingId: string): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://coverartarchive.org/release/${releaseId}`,
        {
          // Use cache-first strategy for faster repeated loads
          cache: 'force-cache',
        }
      );
      if (response.ok) {
        const data = await response.json();
        const albumArt = data.images?.[0]?.thumbnails?.small || data.images?.[0]?.image || null;
        
        // Update cache immediately as each image loads (progressive loading)
        if (albumArt) {
          setAlbumArtCache(prev => ({ ...prev, [recordingId]: albumArt }));
          setLoadingImages(prev => ({ ...prev, [recordingId]: false }));
        }
        
        return albumArt;
      }
    } catch (error) {
      console.error('Album art fetch error:', error);
      setLoadingImages(prev => ({ ...prev, [recordingId]: false }));
    }
    return null;
  };

  const searchSongs = async (page: number = 1) => {
    if (!songName.trim() && !artistName.trim() && !albumName.trim()) return;
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
      
      if (albumName.trim()) {
        queryParts.push(`release:"${albumName.trim()}"`);
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
      setLoading(false); // Set loading to false immediately after getting results
      
      // Fetch album art for each recording in parallel (in background)
      const recordingsToFetch = recordings.filter(
        (recording: Recording) => recording.releases?.[0]?.id && !albumArtCache[recording.id]
      );
      
      // Mark images as loading
      const loadingState: Record<string, boolean> = {};
      recordingsToFetch.forEach((recording: Recording) => {
        loadingState[recording.id] = true;
      });
      setLoadingImages(loadingState);
      
      // Fetch all album art in parallel with progressive loading
      // Images will appear as soon as they're fetched (no waiting for all)
      recordingsToFetch.forEach((recording: Recording) => {
        fetchAlbumArt(recording.releases![0].id, recording.id).catch(error => {
          console.error(`Failed to fetch album art for ${recording.id}:`, error);
          setLoadingImages(prev => ({ ...prev, [recording.id]: false }));
        });
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

  const handleCreatePlaylist = () => {
    if (playlist.length === 0) {
      alert('Please add at least one song to your playlist');
      return;
    }
    
    mockAPI.createPlaylist({
      name: playlistName,
      description: playlistDescription,
      author: 'Anonymous User', // You can make this dynamic
      songs: [...playlist],
    });
    
    setPlaylistPosts(mockAPI.getAllPlaylists());
    
    // Reset the form
    setPlaylist([]);
    setPlaylistName('My Playlist');
    setPlaylistDescription('');
    setCurrentView('feed');
  };

  const handleUpvote = (playlistId: string) => {
    mockAPI.upvotePlaylist(playlistId);
    setPlaylistPosts([...mockAPI.getAllPlaylists()]);
  };

  const handleDownvote = (playlistId: string) => {
    mockAPI.downvotePlaylist(playlistId);
    setPlaylistPosts([...mockAPI.getAllPlaylists()]);
  };

  const handleAddComment = (playlistId: string) => {
    const text = commentText[playlistId]?.trim();
    if (!text) return;
    
    mockAPI.addComment(playlistId, 'Anonymous User', text);
    setPlaylistPosts([...mockAPI.getAllPlaylists()]);
    setCommentText({ ...commentText, [playlistId]: '' });
  };

  const toggleComments = (playlistId: string) => {
    setShowComments({ ...showComments, [playlistId]: !showComments[playlistId] });
  };

  return (
    <div className="min-h-screen bg-background p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Music className="w-8 h-8 text-primary" strokeWidth={3} />
              <h1 className="text-4xl font-head font-bold text-foreground">JAM Rating</h1>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentView('create')}
                variant={currentView === 'create' ? 'default' : 'outline'}
                size="md"
              >
                Create Playlist
              </Button>
              <Button
                onClick={() => setCurrentView('feed')}
                variant={currentView === 'feed' ? 'default' : 'outline'}
                size="md"
              >
                View Feed
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground font-medium">
            {currentView === 'create' 
              ? 'Search for songs and build your custom playlist' 
              : 'Discover and interact with playlists from the community'}
          </p>
        </div>

        {/* Toggle between Create and Feed views */}
        {currentView === 'create' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Search Section */}
            <div className="lg:col-span-2">
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
                  onClick={() => searchSongs(1)}
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
                    <Card
                      key={song.id}
                      className="p-4 flex gap-3 items-start hover:shadow-md transition-all"
                    >
                      {loadingImages[song.id] ? (
                        <div className="w-16 h-16 bg-muted border-2 border-border flex items-center justify-center flex-shrink-0">
                          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : albumArtCache[song.id] ? (
                        <img
                          src={albumArtCache[song.id]}
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
                        onClick={() => addToPlaylist(song)}
                        size="icon"
                        className="flex-shrink-0"
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                    </Card>
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

              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-1">Description (optional)</label>
                <textarea
                  value={playlistDescription}
                  onChange={(e) => setPlaylistDescription(e.target.value)}
                  placeholder="Add a description for your playlist..."
                  className="w-full p-2 border-2 border-border bg-card text-foreground rounded resize-none font-sans"
                  rows={3}
                />
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
                <Button
                  onClick={handleCreatePlaylist}
                  disabled={playlist.length === 0}
                  size="md"
                  className="flex-1 text-sm"
                >
                  Create Playlist
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
        ) : (
          /* Feed View */
          <div className="max-w-4xl mx-auto">
            {playlistPosts.length === 0 ? (
              <Card className="p-12 text-center">
                <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-head font-semibold text-foreground mb-2">No playlists yet</h3>
                <p className="text-muted-foreground mb-4">Be the first to create and share a playlist!</p>
                <Button onClick={() => setCurrentView('create')} size="md">
                  Create Your First Playlist
                </Button>
              </Card>
            ) : (
              <div className="space-y-6">
                {playlistPosts.map((post) => (
                  <Card key={post.id} className="p-6">
                    {/* Playlist Header */}
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h2 className="text-2xl font-head font-bold text-foreground">{post.name}</h2>
                          <p className="text-sm text-muted-foreground">
                            by {post.author} • {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {post.description && (
                        <p className="text-foreground mb-3">{post.description}</p>
                      )}
                    </div>

                    {/* Songs in Playlist */}
                    <div className="mb-4 space-y-2 max-h-64 overflow-y-auto">
                      {post.songs.map((song, index) => (
                        <Card key={song.id} className="p-3 bg-accent">
                          <div className="flex items-center gap-3">
                            <span className="text-muted-foreground font-semibold text-sm w-6">{index + 1}.</span>
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
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>

                    {/* Interaction Buttons */}
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b-2 border-border">
                      <Button
                        onClick={() => handleUpvote(post.id)}
                        variant={post.userVote === 'up' ? 'default' : 'outline'}
                        size="sm"
                        className="gap-2"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>{post.upvotes}</span>
                      </Button>
                      <Button
                        onClick={() => handleDownvote(post.id)}
                        variant={post.userVote === 'down' ? 'secondary' : 'outline'}
                        size="sm"
                        className="gap-2"
                      >
                        <ThumbsDown className="w-4 h-4" />
                        <span>{post.downvotes}</span>
                      </Button>
                      <Button
                        onClick={() => toggleComments(post.id)}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comments.length} {post.comments.length === 1 ? 'Comment' : 'Comments'}</span>
                      </Button>
                    </div>

                    {/* Comments Section */}
                    {showComments[post.id] && (
                      <div className="space-y-3">
                        {/* Add Comment */}
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            value={commentText[post.id] || ''}
                            onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                            placeholder="Add a comment..."
                            className="flex-1"
                          />
                          <Button
                            onClick={() => handleAddComment(post.id)}
                            disabled={!commentText[post.id]?.trim()}
                            size="icon"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Comments List */}
                        {post.comments.length > 0 && (
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {post.comments.map((comment) => (
                              <Card key={comment.id} className="p-3 bg-accent">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-foreground">{comment.author}</p>
                                    <p className="text-sm text-foreground">{comment.text}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {new Date(comment.timestamp).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

