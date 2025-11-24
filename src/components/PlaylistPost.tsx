import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/retroui/Button';
import { Input } from '@/components/retroui/Input';
import { Card } from '@/components/retroui/Card';
import type { PlaylistPost as PlaylistPostType } from '@/types';
import { PlaylistItemCard } from './PlaylistItemCard';

interface PlaylistPostProps {
  post: PlaylistPostType;
  onUpvote: (playlistId: string) => void;
  onDownvote: (playlistId: string) => void;
  onAddComment: (playlistId: string, text: string) => void;
}

export const PlaylistPost: React.FC<PlaylistPostProps> = ({
  post,
  onUpvote,
  onDownvote,
  onAddComment,
}) => {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);

  const handleAddComment = () => {
    const text = commentText.trim();
    if (!text) return;
    
    onAddComment(post.id, text);
    setCommentText('');
  };

  return (
    <Card className="p-6">
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
          <PlaylistItemCard
            key={song.id}
            song={song}
            showIndex={index + 1}
            variant="compact"
          />
        ))}
      </div>

      {/* Interaction Buttons */}
      <div className="flex items-center gap-4 mb-4 pb-4 border-b-2 border-border">
        <Button
          onClick={() => onUpvote(post.id)}
          variant={post.userVote === 'up' ? 'default' : 'outline'}
          size="sm"
          className="gap-2"
        >
          <ThumbsUp className="w-4 h-4" />
          <span>{post.upvotes}</span>
        </Button>
        <Button
          onClick={() => onDownvote(post.id)}
          variant={post.userVote === 'down' ? 'secondary' : 'outline'}
          size="sm"
          className="gap-2"
        >
          <ThumbsDown className="w-4 h-4" />
          <span>{post.downvotes}</span>
        </Button>
        <Button
          onClick={() => setShowComments(!showComments)}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{post.comments.length} {post.comments.length === 1 ? 'Comment' : 'Comments'}</span>
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="space-y-3">
          {/* Add Comment */}
          <div className="flex gap-2">
            <Input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
              placeholder="Add a comment..."
              className="flex-1"
            />
            <Button
              onClick={handleAddComment}
              disabled={!commentText.trim()}
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
  );
};

