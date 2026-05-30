import React from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Redirect URL should map to our ResetPassword component router path
    const resetUrl = `${window.location.origin}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: resetUrl,
    });

    if (error) {
      toast.error(error.message);
    } else {
      setSubmitted(true);
      toast.success('Password reset instructions sent to your email.');
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container relative">
      <div className="auth-card pb-12 mb-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
            <Mail size={32} />
          </div>
          <h2 className="auth-title">Forgot Password</h2>
          <p className="auth-subtitle mt-2 text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
            {submitted 
              ? "Check your inbox for a link to reset your password." 
              : "Enter the email address associated with your account and we'll send you a link to reset your password."}
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="form-label" htmlFor="email">Email Address</label>
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
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn btn-primary mt-6 py-3"
            >
              {loading ? 'Sending Request...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 text-center">
              <p className="text-green-800 dark:text-green-300 font-medium">
                Link Sent!
              </p>
              <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                We've sent an email to <strong>{email}</strong>. Please click the link in that email to reset your password.
              </p>
            </div>
            <button 
              onClick={() => setSubmitted(false)}
              className="w-full btn btn-outline mt-4 py-3"
            >
              Resend Link
            </button>
          </div>
        )}

        <div className="mt-8 text-center border-t border-gray-200 dark:border-gray-700 pt-4">
          <Link to="/login" className="inline-flex items-center text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-white transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
