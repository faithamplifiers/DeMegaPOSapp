import React from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname;

  const { user, profile, loading } = useAuthStore();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  // If user is already signed in, redirect them to their dashboard
  if (!loading && user) {
    const dest = (profile?.role === 'admin' || profile?.role === 'super_admin') ? '/fa-admin' : '/dashboard';
    const finalDest = from && from !== '/login' ? from : dest;
    return <Navigate to={finalDest} replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        toast.error(error.message);
        setSubmitting(false);
        return;
      }

      if (data.user) {
        // Fetch profile to determine correct redirect
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        toast.success('Welcome back!');

        if (profile?.role === 'admin' || profile?.role === 'super_admin') {
          navigate('/fa-admin', { replace: true });
        } else {
          const destPath = from && from !== '/login' ? from : '/dashboard';
          navigate(destPath, { replace: true });
        }
      }
    } catch (err) {
      toast.error('An unexpected error occurred. Please try again.');
    }

    setSubmitting(false);
  };

  return (
    <div className="auth-container relative">
      <div className="auth-card pb-12 mb-10">
        <div className="text-center mb-8">
          <h2 className="auth-title">Community &amp; Creator Login</h2>
          <p className="auth-subtitle">
            Sign in to access your Faith Amplifiers profile
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-secondary focus:border-transparent dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="form-label" htmlFor="password">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-secondary focus:border-transparent dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full btn btn-primary mt-4 py-3 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Signing In...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Forgot your password?{' '}
            <Link to="/forgot-password" className="text-secondary hover:underline cursor-pointer">
              Reset it
            </Link>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-secondary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Administrator access subtle link footer */}
      <div className="absolute bottom-4 left-0 w-full text-center">
        <Link to="/fa-admin/login" className="text-xs text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400 transition-colors">
          Staff &amp; Administrators Login
        </Link>
      </div>
    </div>
  );
};

export default Login;