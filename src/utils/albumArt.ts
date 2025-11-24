export const fetchAlbumArt = async (releaseId: string): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://coverartarchive.org/release/${releaseId}`,
      {
        cache: 'force-cache',
      }
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

export const loadAlbumArtCache = (): Record<string, string> => {
  try {
    const cached = localStorage.getItem('albumArtCache');
    return cached ? JSON.parse(cached) : {};
  } catch {
    return {};
  }
};

export const saveAlbumArtCache = (cache: Record<string, string>): void => {
  try {
    localStorage.setItem('albumArtCache', JSON.stringify(cache));
  } catch (error) {
    console.error('Failed to save cache:', error);
  }
};

