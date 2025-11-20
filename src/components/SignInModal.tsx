import { X, Mail, Lock, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface SignInModalProps {
  onClose: () => void;
  onSwitchToSignUp: () => void;
}

export default function SignInModal({ onClose, onSwitchToSignUp }: SignInModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) throw signInError;

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSwitchToSignUp = () => {
    onClose();
    onSwitchToSignUp();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-black rounded-3xl max-w-md w-full overflow-hidden shadow-[0_0_60px_rgba(139,92,246,0.4)] border border-purple-500/20 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2.5 bg-black/60 hover:bg-black/80 rounded-full transition-all duration-300 backdrop-blur-md border border-white/10 hover:border-purple-500/50 hover:scale-110 group"
          aria-label="Close modal"
        >
          <X className="w-6 h-6 text-white group-hover:text-purple-400 transition-colors" />
        </button>

        <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-8">
          <h2 className="text-4xl font-black text-white">Welcome Back</h2>
          <p className="text-purple-100 mt-2">Sign in to your ShowGo account</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-6">
            <div className="group">
              <label className="flex items-center gap-2 text-purple-300 text-sm font-bold mb-2 uppercase tracking-wide">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="group">
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 text-purple-300 text-sm font-bold uppercase tracking-wide">
                  <Lock className="w-4 h-4" />
                  Password
                </label>
                <button
                  type="button"
                  className="text-purple-400 hover:text-purple-300 text-sm font-semibold transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="mt-8 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-all duration-300 border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={handleSwitchToSignUp}
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              >
                Join now
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
