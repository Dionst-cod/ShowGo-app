import { Menu, X, User, Plus, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import CreateEventModal from './CreateEventModal';
import SignInModal from './SignInModal';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface NavigationProps {
  onOpenSignUp: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToHome?: () => void;
}

export default function Navigation({ onOpenSignUp, onNavigateToProfile, onNavigateToHome }: NavigationProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button onClick={onNavigateToHome} className="text-2xl font-bold text-white hover:text-purple-400 transition-colors">
                ShowGo
              </button>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <button onClick={onNavigateToHome} className="text-gray-300 hover:text-purple-400 transition-colors font-medium">
                Events
              </button>
              {user && (
                <>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]"
                  >
                    <Plus size={18} />
                    Create Event
                  </button>
                  <button
                    onClick={onNavigateToProfile}
                    className="text-gray-300 hover:text-purple-400 transition-colors font-medium"
                  >
                    Profile
                  </button>
                </>
              )}
            </div>

            <div className="hidden md:flex items-center space-x-6">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-all duration-300 border border-gray-700"
                >
                  Logout
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsSignInModalOpen(true)}
                    className="text-gray-300 hover:text-purple-400 transition-colors font-medium"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={onOpenSignUp}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-300"
                  >
                    Join now
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-300 hover:text-purple-400 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-black/95 border-t border-gray-800">
            <div className="px-4 py-4 space-y-3">
              <button
                onClick={() => {
                  onNavigateToHome?.();
                  setIsMenuOpen(false);
                }}
                className="block text-gray-300 hover:text-purple-400 transition-colors font-medium py-2 w-full text-left"
              >
                Events
              </button>
              {user && (
                <>
                  <button
                    onClick={() => {
                      setIsCreateModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all duration-300"
                  >
                    <Plus size={18} />
                    Create Event
                  </button>
                  <button
                    onClick={() => {
                      onNavigateToProfile?.();
                      setIsMenuOpen(false);
                    }}
                    className="block text-gray-300 hover:text-purple-400 transition-colors font-medium py-2 w-full text-left"
                  >
                    Profile
                  </button>
                </>
              )}
              {user ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-all duration-300 border border-gray-700"
                >
                  Logout
                </button>
              ) : (
                <>
                  <button
                    className="block text-gray-300 hover:text-purple-400 transition-colors font-medium py-2 w-full text-left"
                    onClick={() => {
                      setIsSignInModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => {
                      onOpenSignUp();
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-300"
                  >
                    Join now
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {isCreateModalOpen && <CreateEventModal onClose={() => setIsCreateModalOpen(false)} />}
      {isSignInModalOpen && (
        <SignInModal
          onClose={() => setIsSignInModalOpen(false)}
          onSwitchToSignUp={() => {
            setIsSignInModalOpen(false);
            onOpenSignUp();
          }}
        />
      )}
    </>
  );
}
