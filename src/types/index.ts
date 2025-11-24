export interface Recording {
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

export interface PlaylistItem {
  id: string;
  title: string;
  artist: string;
  releaseDate: string;
  mbid: string;
  albumArt?: string;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: Date;
}

export interface PlaylistPost {
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
