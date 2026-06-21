import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../../api/endpoints';

const mapApiError = (err) => {
  if (!err) return 'Unexpected error';
  if (err.code === 'BAD_REQUEST' && err.details?.issues?.length) {
    return err.details.issues[0].message || 'Validation failed';
  }
  return err.message || 'Request failed';
};

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);

  useEffect(() => {
    // Validate that token and email are present
    if (!token || !email) {
      setInvalidLink(true);
    }
  }, [token, email]);

  const validatePassword = () => {
    if (!newPassword.trim()) {
      toast.error('Please enter a password');
      return false;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return false;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword()) return;

    setIsLoading(true);
    try {
      await authApi.resetPassword(token, email, newPassword);
      setSubmitted(true);
      toast.success('Password reset successfully!');
    } catch (err) {
      console.error(err);
      const msg = mapApiError(err);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Invalid link state
  if (invalidLink) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-orange-600" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-slate-900 text-center mb-2">
              Invalid Reset Link
            </h1>
            <p className="text-center text-slate-600 mb-6">
              The password reset link is invalid or has expired. Please request a new one.
            </p>

            <Link
              to="/forgot-password"
              className='w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white font-medium text-sm transition-all duration-200 bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:shadow-primary-500/25 disabled:opacity-70 disabled:cursor-not-allowed'
            >
              Request New Link
            </Link>

            <p className="text-center text-slate-600 mt-6">
              <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                Back to login
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm">
          {!submitted ? (
            <>
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Lock className="w-8 h-8 text-indigo-600" />
                </div>
              </div>

              {/* Heading */}
              <h1 className="text-3xl font-bold text-slate-900 text-center mb-2">
                Create new password
              </h1>
              <p className="text-center text-slate-600 mb-8">
                Enter a strong password to secure your account
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password */}
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-semibold text-slate-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      disabled={isLoading}
                      className="w-full px-4 py-2 pr-10 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    At least 8 characters long
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      disabled={isLoading}
                      className="w-full px-4 py-2 pr-10 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className='w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white font-medium text-sm transition-all duration-200 bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:shadow-primary-500/25 disabled:opacity-70 disabled:cursor-not-allowed'
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      Reset Password
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Back to Login */}
              <p className="text-center text-slate-600 mt-6">
                <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                  Back to login
                </Link>
              </p>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
              </div>

              <h1 className="text-3xl font-bold text-slate-900 text-center mb-2">
                Password reset successful
              </h1>
              <p className="text-center text-slate-600 mb-8">
                Your password has been reset. You can now log in with your new password.
              </p>

              <button
                onClick={() => navigate('/login')}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-semibold"
              >
                Go to Login
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
