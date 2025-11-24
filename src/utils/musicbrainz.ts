import type { Recording } from '@/types';

const MUSICBRAINZ_API_BASE = 'https://musicbrainz.org/ws/2';
const USER_AGENT = 'JamRating/1.0.0 (https://github.com/yourusername/jam-rating)';

interface SearchParams {
  songName?: string;
  artistName?: string;
  albumName?: string;
  page?: number;
  limit?: number;
}

interface MusicBrainzSearchResponse {
  recordings: Recording[];
  count: number;
  offset: number;
}

/**
 * Search for songs on MusicBrainz based on song name, artist, and/or album
 */
export async function searchSongs({
  songName = '',
  artistName = '',
  albumName = '',
  page = 1,
  limit = 10,
}: SearchParams): Promise<{ recordings: Recording[]; totalResults: number }> {
  // Build the query string
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
  
  if (queryParts.length === 0) {
    return { recordings: [], totalResults: 0 };
  }
  
  const query = queryParts.join(' AND ');
  const offset = (page - 1) * limit;
  
  // Construct the API URL
  const params = new URLSearchParams({
    query,
    fmt: 'json',
    limit: limit.toString(),
    offset: offset.toString(),
  });
  
  const url = `${MUSICBRAINZ_API_BASE}/recording?${params.toString()}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`MusicBrainz API error: ${response.status} ${response.statusText}`);
    }
    
    const data: MusicBrainzSearchResponse = await response.json();
    
    return {
      recordings: data.recordings || [],
      totalResults: data.count || 0,
    };
  } catch (error) {
    console.error('Error searching MusicBrainz:', error);
    throw error;
  }
}

/**
 * Get detailed information about a specific recording by ID
 */
export async function getRecordingById(recordingId: string): Promise<Recording | null> {
  const url = `${MUSICBRAINZ_API_BASE}/recording/${recordingId}?fmt=json&inc=artist-credits+releases`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`MusicBrainz API error: ${response.status} ${response.statusText}`);
    }
    
    const data: Recording = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching recording from MusicBrainz:', error);
    return null;
  }
}

