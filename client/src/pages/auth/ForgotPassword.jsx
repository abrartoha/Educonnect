import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../../api/endpoints';

const mapApiError = (err) => {
  if (!err) return 'Unexpected error';
  if (err.code === 'BAD_REQUEST' && err.details?.issues?.length) {
    return err.details.issues[0].message || 'Validation failed';
  }
  return err.message || 'Request failed';
};

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSubmitted(true);
      toast.success('Reset link sent to your email!');
    } catch (err) {
      console.error(err);
      const msg = mapApiError(err);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Header Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm">
          {!submitted ? (
            <>
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-indigo-600" />
                </div>
              </div>

              {/* Heading */}
              <h1 className="text-3xl font-bold text-slate-900 text-center mb-2">
                Reset your password
              </h1>
              <p className="text-center text-slate-600 mb-8">
                Enter your email and we'll send you a link to reset your password
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={isLoading}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className='w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white font-medium text-sm transition-all duration-200 bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:shadow-primary-500/25 disabled:opacity-70 disabled:cursor-not-allowed'
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Back to Login */}
              <p className="text-center text-slate-600 mt-6">
                Remember your password?{' '}
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
                Check your email
              </h1>
              <p className="text-center text-slate-600 mb-6">
                We've sent a password reset link to{' '}
                <span className="font-semibold text-slate-700">{email}</span>
              </p>

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-8">
                <p className="text-sm text-slate-700">
                  <strong>Next steps:</strong> Click the link in the email to reset your password. The link will expire in 3 minutes for security.
                </p>
              </div>

              <button
                onClick={() => navigate('/login')}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-semibold"
              >
                Back to Login
              </button>

              <p className="text-center text-slate-600 text-sm mt-6">
                Didn't receive the email?{' '}
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setEmail('');
                  }}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold"
                >
                  Try again
                </button>
              </p>
            </>
          )}
        </div>

        {/* Footer text */}
        <p className="text-center text-slate-500 text-sm mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-indigo-600 hover:text-indigo-700 font-semibold">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
