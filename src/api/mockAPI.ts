import type { PlaylistPost, Comment } from '../types';

class MockAPI {
  private playlists: PlaylistPost[] = [];

  createPlaylist(playlist: Omit<PlaylistPost, 'id' | 'createdAt' | 'upvotes' | 'downvotes' | 'comments' | 'userVote'>): PlaylistPost {
    const newPlaylist: PlaylistPost = {
      ...playlist,
      id: `playlist-${Date.now()}`,
      upvotes: 0,
      downvotes: 0,
      comments: [],
      createdAt: new Date(),
      userVote: null,
    };
    this.playlists.unshift(newPlaylist);
    return newPlaylist;
  }

  getAllPlaylists(): PlaylistPost[] {
    return this.playlists;
  }

  upvotePlaylist(playlistId: string): PlaylistPost | null {
    const playlist = this.playlists.find(p => p.id === playlistId);
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
  }

  downvotePlaylist(playlistId: string): PlaylistPost | null {
    const playlist = this.playlists.find(p => p.id === playlistId);
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
  }

  addComment(playlistId: string, author: string, text: string): Comment | null {
    const playlist = this.playlists.find(p => p.id === playlistId);
    if (!playlist) return null;
    
    const comment: Comment = {
      id: `comment-${Date.now()}`,
      author,
      text,
      timestamp: new Date(),
    };
    playlist.comments.push(comment);
    return comment;
  }
}

export const mockAPI = new MockAPI();

