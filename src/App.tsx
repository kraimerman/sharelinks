import React, { useState, useEffect } from 'react';
import { Share2, LogIn, LogOut, UserPlus } from 'lucide-react';
import LinkCard from './components/LinkCard';
import ShareLinkForm from './components/ShareLinkForm';
import AuthModal from './components/AuthModal';
import { fetchLinks, addLink, updateVotes, addComment, updateLink } from './lib/api';
import { signUp, signIn, signOut } from './lib/auth';
import { auth } from './lib/firebase';
import type { Link } from './lib/api';
import type { User } from 'firebase/auth';

function App() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'signin' | 'signup' }>({
    isOpen: false,
    mode: 'signin'
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    try {
      const fetchedLinks = await fetchLinks();
      setLinks(fetchedLinks);
      setError(null);
    } catch (err) {
      setError('Failed to load links. Please try again later.');
      console.error('Error loading links:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShareLink = async (newLink: { title: string; url: string; description: string }) => {
    if (!user) {
      setError('Please sign in to share links.');
      return;
    }

    try {
      setError(null);
      const linkId = await addLink({
        ...newLink,
        author: user.displayName || 'Anonymous',
      });
      
      await loadLinks();
    } catch (err) {
      setError('Failed to share link. Please try again.');
      console.error('Error sharing link:', err);
    }
  };

  const handleVoteUpdate = async (linkId: string, type: 'upvote' | 'downvote', newValue: number) => {
    if (!user) {
      setError('Please sign in to vote.');
      return;
    }

    try {
      await updateVotes(linkId, type, newValue);
      await loadLinks();
    } catch (err) {
      console.error('Error updating votes:', err);
    }
  };

  const handleAddComment = async (linkId: string, comment: { text: string }) => {
    if (!user) {
      setError('Please sign in to comment.');
      return;
    }

    try {
      await addComment(linkId, {
        text: comment.text,
        author: user.displayName || 'Anonymous',
      });
      await loadLinks();
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleEditLink = async (linkId: string, updates: { title: string; url: string; description: string }) => {
    if (!user) {
      setError('Please sign in to edit links.');
      return;
    }

    try {
      await updateLink(linkId, updates);
      await loadLinks();
    } catch (err) {
      console.error('Error updating link:', err);
    }
  };

  const handleAuth = async (data: { email: string; password: string; nickname?: string }) => {
    try {
      if (authModal.mode === 'signup') {
        if (!data.nickname) throw new Error('Nickname is required');
        await signUp({ email: data.email, password: data.password, nickname: data.nickname });
      } else {
        await signIn({ email: data.email, password: data.password });
      }
      setAuthModal({ isOpen: false, mode: 'signin' });
      setError(null);
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 className="text-blue-600" size={32} />
              <h1 className="text-3xl font-bold text-gray-900">ShareLinks</h1>
            </div>
            <div className="flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">
                    Welcome, {user.displayName || 'User'}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setAuthModal({ isOpen: true, mode: 'signin' })}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
                  >
                    <LogIn size={18} />
                    Sign In
                  </button>
                  <button
                    onClick={() => setAuthModal({ isOpen: true, mode: 'signup' })}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <UserPlus size={18} />
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <ShareLinkForm onSubmit={handleShareLink} isAuthenticated={!!user} />

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {links.map((link) => (
              <LinkCard
                key={link.id}
                {...link}
                onVoteUpdate={(type, newValue) => handleVoteUpdate(link.id, type, newValue)}
                onAddComment={(comment) => handleAddComment(link.id, comment)}
                onEditLink={(updates) => handleEditLink(link.id, updates)}
                isAuthenticated={!!user}
                currentUser={user?.displayName || null}
              />
            ))}
          </div>
        )}
      </main>

      <AuthModal
        isOpen={authModal.isOpen}
        mode={authModal.mode}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        onSubmit={handleAuth}
      />

      <footer className="bg-white border-t">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <p className="text-center text-gray-600">
            ShareLinks - Share and discover interesting links
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;