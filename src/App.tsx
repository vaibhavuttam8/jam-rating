import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { FeedPage } from '@/pages/FeedPage';
import { CreatePlaylistPage } from '@/pages/CreatePlaylistPage';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<FeedPage />} />
          <Route path="/create" element={<CreatePlaylistPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
