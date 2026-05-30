import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionVerified, setSessionVerified] = useState<boolean | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // When landing here from an email, Supabase should parse the hash and set an active session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      // Wait slightly to ensure hash fragment resolves into session
      setTimeout(async () => {
          const { data: { session: delayedSession } } = await supabase.auth.getSession();
          if (delayedSession) {
             setSessionVerified(true);
          } else {
             setSessionVerified(false);
          }
      }, 1000);
    };
    
    checkSession();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password updated successfully!');
      setSuccess(true);
      // Wait for user to read success message before booting them to login
      setTimeout(() => {
         supabase.auth.signOut(); // Ensure clean slate
         navigate('/login');
      }, 3000);
    }
    
    setLoading(false);
  };

  if (sessionVerified === null) {
      return (
         <div className="auth-container min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
         </div>
      );
  }

  // If the user lands here directly without a valid recovery token in URL
  if (sessionVerified === false && !success) {
      return (
         <div className="auth-container min-h-screen flex items-center justify-center">
            <div className="auth-card text-center">
               <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
                  <Lock size={32} />
               </div>
               <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Invalid or Expired Link</h2>
               <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Your password reset link is invalid or has expired. Please request a new one.
               </p>
               <Link to="/forgot-password" className="btn btn-primary px-8">
                  Request New Link
               </Link>
            </div>
         </div>
      );
  }

  return (
    <div className="auth-container relative">
      <div className="auth-card pb-12 mb-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
             {success ? <CheckCircle size={32} className="text-green-500" /> : <Lock size={32} />}
          </div>
          <h2 className="auth-title">
             {success ? "Password Updated" : "Reset Password"}
          </h2>
          <p className="auth-subtitle mt-2 text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
             {success 
                ? "Your password has been successfully updated. Redirecting to login..."
                : "Create a new strong password for your Faith Amplifiers account."
             }
          </p>
        </div>

        {!success && (
           <form onSubmit={handleUpdatePassword} className="space-y-4">
               <div>
               <label className="form-label" htmlFor="password">New Password</label>
               <div className="relative">
                  <input 
                     id="password"
                     type={showPassword ? "text" : "password"} 
                     required 
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-secondary focus:border-transparent dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500" 
                     placeholder="New Password"
                     minLength={6}
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

               <div>
               <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
               <div className="relative">
                  <input 
                     id="confirmPassword"
                     type={showPassword ? "text" : "password"} 
                     required 
                     value={confirmPassword}
                     onChange={(e) => setConfirmPassword(e.target.value)}
                     className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-secondary focus:border-transparent dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500" 
                     placeholder="Confirm Password"
                     minLength={6}
                  />
               </div>
               </div>
               
               <button 
               type="submit" 
               disabled={loading}
               className="w-full btn btn-primary mt-6 py-3"
               >
               {loading ? 'Updating Password...' : 'Save New Password'}
               </button>
           </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
