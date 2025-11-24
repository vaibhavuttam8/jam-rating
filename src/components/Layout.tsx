import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Music, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/retroui/Button';
import { useTheme } from '@/contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

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
                onClick={toggleTheme}
                variant="outline"
                size="icon"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </Button>
              <Button
                onClick={() => navigate('/create')}
                variant={location.pathname === '/create' ? 'default' : 'outline'}
                size="md"
              >
                Create Playlist
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant={location.pathname === '/' ? 'default' : 'outline'}
                size="md"
              >
                View Feed
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground font-medium">
            {location.pathname === '/create' 
              ? 'Search for songs and build your custom playlist' 
              : 'Discover and interact with playlists from the community'}
          </p>
        </div>

        {/* Page Content */}
        {children}
      </div>
    </div>
  );
};

