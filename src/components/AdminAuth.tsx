import React, { useState } from 'react';
import { Mail, Lock, LogIn, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { auth } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword
} from 'firebase/auth';

interface AdminAuthProps {
  onSuccess: () => void;
  onNavigateHome: () => void;
}

export default function AdminAuth({ onSuccess, onNavigateHome }: AdminAuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onSuccess();
    } catch (err: any) {
      console.error(err);
      let friendlyMessage = 'Authentication failed. Please check your credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        friendlyMessage = 'Invalid email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        friendlyMessage = 'An account with this email already exists.';
      } else if (err.code === 'auth/invalid-email') {
        friendlyMessage = 'Please enter a valid email address.';
      } else if (err.code === 'auth/weak-password') {
        friendlyMessage = 'Password should be at least 6 characters.';
      }
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-panel py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <button
          onClick={onNavigateHome}
          className="mx-auto flex items-center gap-2 text-xs font-bold font-mono tracking-wider text-brand-blue hover:text-brand-blue-dark transition-colors uppercase mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Portal
        </button>

        <div className="text-center">
          <h2 className="mt-2 text-center text-3xl font-display font-bold tracking-tight text-ink">
            {isSignUp ? 'Create Admin Account' : 'admin panel'}
          </h2>
          <p className="mt-2 text-center text-xs text-ink2 max-w">
            Authorized observatory staff only. Access is logged and audited.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-line sm:rounded-2xl sm:px-10 shadow-custom">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 text-xs text-red-800">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <div className="font-medium leading-normal">{error}</div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleEmailAuth}>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-ink font-mono mb-2">
                Email Address
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4.5 w-4.5 text-mut" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@athenaobservatory.org"
                  className="block w-full pl-10 pr-3 py-2.5 border border-line rounded-lg text-sm bg-white text-ink placeholder:text-mut focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-ink font-mono mb-2">
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4.5 w-4.5 text-mut" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 border border-line rounded-lg text-sm bg-white text-ink placeholder:text-mut focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-xs font-semibold font-mono tracking-wider uppercase text-white bg-navy hover:bg-navy-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50 transition-all cursor-pointer items-center gap-2 shadow-sm"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                <span>{isSignUp ? 'Register Account' : 'Sign In with Credentials'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
