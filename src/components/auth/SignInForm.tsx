import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { signIn } from '../../services/firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout from './AuthLayout';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const getErrorMessage = (error: any): string => {
    if (typeof error === 'string') return error;
    
    const errorCode = error?.code || '';
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Please enter a valid email address';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support';
      case 'auth/user-not-found':
        return 'No account found with this email. Please check your email or sign up';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again or reset your password';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later or reset your password';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection';
      default:
        return 'Unable to sign in. Please try again';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email.trim(), password);
      navigate('/');
      toast.success('Welcome back!');
    } catch (error) {
      const message = getErrorMessage(error);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue planning your adventures"
      footer={
        <>
          Don't have an account?{' '}
          <Link to="/signup" className="text-indigo-600 hover:text-indigo-700">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <div className="mt-1 relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <Link to="/reset-password" className="text-sm text-indigo-600 hover:text-indigo-700">
              Forgot password?
            </Link>
          </div>
          <div className="mt-1 relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}