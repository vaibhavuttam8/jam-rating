import React, { useState, useRef } from 'react';
import { Button } from '@/components/retroui/Button';
import { Input } from '@/components/retroui/Input';
import { Card } from '@/components/retroui/Card';
import { ImagePlus, X } from 'lucide-react';
import type { PlaylistItem } from '@/types';
import { PlaylistItemCard } from './PlaylistItemCard';

interface PlaylistBuilderProps {
  playlist: PlaylistItem[];
  onRemoveFromPlaylist: (id: string) => void;
  onClearPlaylist: () => void;
  onCreatePlaylist: (name: string, description: string, coverImage?: string) => void;
}

export const PlaylistBuilder: React.FC<PlaylistBuilderProps> = ({
  playlist,
  onRemoveFromPlaylist,
  onClearPlaylist,
  onCreatePlaylist,
}) => {
  const [playlistName, setPlaylistName] = useState('My Playlist');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [coverImage, setCoverImage] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setCoverImage(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreate = () => {
    if (playlist.length === 0) {
      alert('Please add at least one song to your playlist');
      return;
    }
    onCreatePlaylist(playlistName, playlistDescription, coverImage);
    setPlaylistName('My Playlist');
    setPlaylistDescription('');
    setCoverImage(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
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

      <div className="mb-4">
        <label className="block text-sm font-medium text-foreground mb-2">Cover Image (optional)</label>
        {coverImage ? (
          <div className="relative">
            <img
              src={coverImage}
              alt="Playlist cover"
              className="w-full h-48 object-cover rounded border-2 border-border"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition"
              aria-label="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="cover-image-input"
            />
            <label
              htmlFor="cover-image-input"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded cursor-pointer hover:border-primary transition bg-card"
            >
              <ImagePlus className="w-8 h-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Click to upload cover image</span>
              <span className="text-xs text-muted-foreground mt-1">Max 5MB</span>
            </label>
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        <Button
          onClick={onClearPlaylist}
          disabled={playlist.length === 0}
          variant="secondary"
          className="flex-1 bg-destructive hover:bg-destructive text-destructive-foreground border-destructive text-sm"
        >
          Clear
        </Button>
        <Button
          onClick={handleCreate}
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
            <PlaylistItemCard
              key={song.id}
              song={song}
              onRemove={onRemoveFromPlaylist}
            />
          ))
        ) : (
          <p className="text-muted-foreground text-center py-8 text-sm">Add songs to your playlist</p>
        )}
      </div>
    </Card>
  );
};

