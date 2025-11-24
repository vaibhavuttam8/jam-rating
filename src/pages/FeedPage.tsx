import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music } from 'lucide-react';
import { Button } from '@/components/retroui/Button';
import { Card } from '@/components/retroui/Card';
import { mockAPI } from '@/api/mockAPI';
import type { PlaylistPost as PlaylistPostType } from '@/types';
import { PlaylistPost } from '@/components/PlaylistPost';

export const FeedPage: React.FC = () => {
  const [playlistPosts, setPlaylistPosts] = useState<PlaylistPostType[]>(() => 
    mockAPI.getAllPlaylists()
  );
  const navigate = useNavigate();

  const handleUpvote = (playlistId: string) => {
    mockAPI.upvotePlaylist(playlistId);
    setPlaylistPosts([...mockAPI.getAllPlaylists()]);
  };

  const handleDownvote = (playlistId: string) => {
    mockAPI.downvotePlaylist(playlistId);
    setPlaylistPosts([...mockAPI.getAllPlaylists()]);
  };

  const handleAddComment = (playlistId: string, text: string) => {
    mockAPI.addComment(playlistId, 'Anonymous User', text);
    setPlaylistPosts([...mockAPI.getAllPlaylists()]);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {playlistPosts.length === 0 ? (
        <Card className="p-12 text-center">
          <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-head font-semibold text-foreground mb-2">No playlists yet</h3>
          <p className="text-muted-foreground mb-4">Be the first to create and share a playlist!</p>
          <Button className=" mx-auto" onClick={() => navigate('/create')} size="md">
            Create Your First Playlist
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {playlistPosts.map((post) => (
            <PlaylistPost
              key={post.id}
              post={post}
              onUpvote={handleUpvote}
              onDownvote={handleDownvote}
              onAddComment={handleAddComment}
            />
          ))}
        </div>
      )}
    </div>
  );
};

