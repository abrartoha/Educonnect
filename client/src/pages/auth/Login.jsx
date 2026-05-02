import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  Building2,
  Users,
  UserCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  ArrowRight,
  Loader2,
  BookOpen,
  Globe,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useStore from '../../store/useStore';

const roles = [
  {
    id: 'admin',
    label: 'Admin',
    icon: Shield,
    color: 'from-purple-600 to-indigo-600',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-300',
    ringColor: 'ring-purple-500',
    hoverBg: 'hover:bg-purple-50',
    accentBg: 'bg-purple-600',
  },
  {
    id: 'university',
    label: 'University',
    icon: Building2,
    color: 'from-blue-600 to-cyan-600',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-300',
    ringColor: 'ring-blue-500',
    hoverBg: 'hover:bg-blue-50',
    accentBg: 'bg-blue-600',
  },
  {
    id: 'agent',
    label: 'Agent',
    icon: Users,
    color: 'from-emerald-600 to-teal-600',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-300',
    ringColor: 'ring-emerald-500',
    hoverBg: 'hover:bg-emerald-50',
    accentBg: 'bg-emerald-600',
  },
  {
    id: 'consultant',
    label: 'Consultant',
    icon: UserCheck,
    color: 'from-orange-500 to-amber-500',
    bgLight: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-300',
    ringColor: 'ring-orange-500',
    hoverBg: 'hover:bg-orange-50',
    accentBg: 'bg-orange-500',
  },
  {
    id: 'student',
    label: 'Student',
    icon: GraduationCap,
    color: 'from-violet-500 to-purple-500',
    bgLight: 'bg-violet-50',
    textColor: 'text-violet-700',
    borderColor: 'border-violet-300',
    ringColor: 'ring-violet-500',
    hoverBg: 'hover:bg-violet-50',
    accentBg: 'bg-violet-500',
  },
];

const demoCredentials = {
  admin: { email: 'admin@educonnect.com.au', password: 'Admin12345' },
  university: { email: 'admissions@unimelb.edu.au', password: 'Password123' },
  agent: { email: 'sarah@pacificedu.com.au', password: 'Password123' },
  consultant: { email: 'emma.thompson@educonsult.com.au', password: 'Password123' },
  student: { email: 'arun.kumar@gmail.com', password: 'Password123' },
};

const dashboardRoutes = {
  admin: '/admin',
  university: '/university',
  agent: '/agent',
  consultant: '/consultant',
  student: '/student',
};

export default function Login() {
  const navigate = useNavigate();
  const login = useStore((s) => s.login);

  const [selectedRole, setSelectedRole] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const activeRole = roles.find((r) => r.id === selectedRole);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    if (!password.trim()) {
      toast.error('Please enter your password');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);

    if (result.success) {
      toast.success(`Welcome back, ${result.user.name}`);
      const target = dashboardRoutes[result.user.role] || '/';
      navigate(target);
    } else {
      toast.error(result.error || 'Login failed. Please try again.');
    }

    setIsLoading(false);
  };

  const fillDemoCredentials = () => {
    const creds = demoCredentials[selectedRole];
    setEmail(creds.email);
    setPassword(creds.password);
    toast.success('Demo credentials filled!', { icon: '💡', duration: 1500 });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex"
    >
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${activeRole.color} transition-colors duration-500`} />

        {/* Decorative circles */}
        <div className="absolute top-20 -left-16 w-64 h-64 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-32 -right-20 w-80 h-80 bg-white/10 rounded-full blur-xl" />
        <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-white/5 rounded-full" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-10 text-white w-full">
          {/* Logo area */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">EduConnect</span>
            </div>
            <p className="text-white/60 text-sm ml-14">Australia's Education Marketplace</p>
          </div>

          {/* Center illustration */}
          <div className="flex-1 flex flex-col items-center justify-center gap-8 py-12">
            {/* Stunning 3D Animated Icon */}
            <div className="relative w-52 h-52" style={{ perspective: '1000px' }}>

              {/* Pulsing aura — large soft glow behind everything */}
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.25, 0.45, 0.25],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 -m-8 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 70%)',
                }}
              />

              {/* Spinning conic gradient ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-4 rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.3) 10%, transparent 20%, transparent 50%, rgba(255,255,255,0.2) 60%, transparent 70%)',
                  maskImage: 'radial-gradient(circle, transparent 55%, black 56%, black 100%)',
                  WebkitMaskImage: 'radial-gradient(circle, transparent 55%, black 56%, black 100%)',
                }}
              />

              {/* Counter-rotating inner ring with dots */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-2 rounded-full border border-dashed border-white/10"
              >
                {[0, 90, 180, 270].map((deg) => (
                  <div
                    key={deg}
                    className="absolute w-2 h-2 bg-white/50 rounded-full"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: `rotate(${deg}deg) translateX(calc(50% + 46px)) translate(-50%, -50%)`,
                    }}
                  />
                ))}
              </motion.div>

              {/* Sparkle particles — 8 particles floating upward */}
              {[...Array(8)].map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                const radius = 42 + (i % 3) * 12;
                return (
                  <motion.div
                    key={`spark-${selectedRole}-${i}`}
                    className="absolute rounded-full"
                    style={{
                      width: i % 2 === 0 ? '3px' : '2px',
                      height: i % 2 === 0 ? '3px' : '2px',
                      background: i % 3 === 0 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
                      top: `calc(50% + ${Math.sin(angle) * radius}px)`,
                      left: `calc(50% + ${Math.cos(angle) * radius}px)`,
                      boxShadow: i % 2 === 0 ? '0 0 6px 2px rgba(255,255,255,0.4)' : 'none',
                    }}
                    animate={{
                      y: [0, -20 - i * 3, 0],
                      x: [0, (i % 2 === 0 ? 8 : -8), 0],
                      opacity: [0.2, 1, 0.2],
                      scale: [0.8, 1.4, 0.8],
                    }}
                    transition={{
                      duration: 3 + i * 0.4,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: 'easeInOut',
                    }}
                  />
                );
              })}

              {/* Breathing shadow underneath */}
              <motion.div
                animate={{
                  scale: [0.7, 0.9, 0.7],
                  opacity: [0.15, 0.3, 0.15],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-28 h-5 bg-black/20 rounded-full blur-lg"
              />

              {/* 3D Floating hexagonal icon container */}
              <motion.div
                key={selectedRole}
                initial={{ rotateY: 180, rotateZ: -30, scale: 0.3, opacity: 0 }}
                animate={{ rotateY: 0, rotateZ: 0, scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 80, damping: 12, mass: 0.8 }}
                className="absolute inset-0 flex items-center justify-center"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <motion.div
                  animate={{
                    rotateY: [0, 12, 0, -12, 0],
                    rotateX: [0, -8, 0, 8, 0],
                    y: [0, -6, 0, -6, 0],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="relative w-36 h-36"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Glass front face */}
                  <div
                    className="absolute inset-0 rounded-[28px] flex items-center justify-center overflow-hidden"
                    style={{
                      transform: 'translateZ(24px)',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.08) 100%)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.1)',
                    }}
                  >
                    {/* Inner shimmer */}
                    <motion.div
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 45%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.2) 55%, transparent 60%)',
                      }}
                    />
                    <motion.div
                      animate={{ scale: [1, 1.08, 1], rotate: [0, 3, 0, -3, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <activeRole.icon
                        className="w-16 h-16 text-white relative z-10"
                        strokeWidth={1.5}
                        style={{ filter: 'drop-shadow(0 4px 12px rgba(255,255,255,0.3))' }}
                      />
                    </motion.div>
                  </div>

                  {/* Top face — glossy edge */}
                  <div
                    className="absolute left-0 right-0 top-0 rounded-t-[28px]"
                    style={{
                      height: '48px',
                      transform: 'rotateX(90deg)',
                      transformOrigin: 'top',
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.05) 100%)',
                    }}
                  />

                  {/* Right face — subtle depth */}
                  <div
                    className="absolute top-0 right-0 h-full rounded-r-[28px]"
                    style={{
                      width: '48px',
                      transform: 'rotateY(90deg)',
                      transformOrigin: 'right',
                      background: 'linear-gradient(90deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 100%)',
                    }}
                  />

                  {/* Rear glow face */}
                  <div
                    className="absolute inset-0 rounded-[28px]"
                    style={{
                      transform: 'translateZ(-24px)',
                      background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
                    }}
                  />
                </motion.div>
              </motion.div>

              {/* Orbiting 3D ring with two glowing orbs */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ perspective: '600px' }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
                  className="w-48 h-48"
                  style={{ transform: 'rotateX(65deg) rotateZ(-15deg)', transformStyle: 'preserve-3d' }}
                >
                  <div className="absolute inset-0 rounded-full border border-white/15" />
                  {/* Orb 1 */}
                  <div
                    className="absolute w-3.5 h-3.5 rounded-full"
                    style={{
                      top: '-7px', left: '50%', marginLeft: '-7px',
                      background: 'radial-gradient(circle, rgba(255,255,255,0.95) 20%, rgba(255,255,255,0.3) 70%, transparent 100%)',
                      boxShadow: '0 0 12px 4px rgba(255,255,255,0.4)',
                    }}
                  />
                  {/* Orb 2 — opposite side */}
                  <div
                    className="absolute w-2.5 h-2.5 rounded-full"
                    style={{
                      bottom: '-5px', left: '50%', marginLeft: '-5px',
                      background: 'radial-gradient(circle, rgba(255,255,255,0.7) 20%, rgba(255,255,255,0.2) 70%, transparent 100%)',
                      boxShadow: '0 0 8px 3px rgba(255,255,255,0.25)',
                    }}
                  />
                </motion.div>
              </div>

              {/* Second orbit — perpendicular, slower */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ perspective: '600px' }}
              >
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 11, repeat: Infinity, ease: 'linear' }}
                  className="w-40 h-40"
                  style={{ transform: 'rotateX(75deg) rotateZ(60deg)', transformStyle: 'preserve-3d' }}
                >
                  <div className="absolute inset-0 rounded-full border border-white/8" />
                  <div
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      top: '-4px', left: '50%', marginLeft: '-4px',
                      background: 'radial-gradient(circle, rgba(255,255,255,0.8) 30%, transparent 100%)',
                      boxShadow: '0 0 8px 2px rgba(255,255,255,0.3)',
                    }}
                  />
                </motion.div>
              </div>
            </div>

            <div className="text-center max-w-xs">
              <motion.h2
                key={`title-${selectedRole}`}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-2xl font-bold mb-3"
              >
                {selectedRole === 'admin' && 'Platform Administration'}
                {selectedRole === 'university' && 'Manage Your Institution'}
                {selectedRole === 'agent' && 'Connect Students Globally'}
                {selectedRole === 'consultant' && 'Guide & Advise Students'}
                {selectedRole === 'student' && 'Your Learning Journey'}
              </motion.h2>
              <motion.p
                key={`desc-${selectedRole}`}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-white/70 text-sm leading-relaxed"
              >
                {selectedRole === 'admin' &&
                  'Oversee the entire EduConnect platform. Manage users, monitor activity, and ensure quality.'}
                {selectedRole === 'university' &&
                  'Showcase your university to thousands of prospective students. Manage listings, respond to inquiries, and grow enrolments.'}
                {selectedRole === 'agent' &&
                  'Help students discover the right educational pathway. Manage your portfolio and track placements.'}
                {selectedRole === 'consultant' &&
                  'Provide expert guidance on admissions, visas, and career pathways. Build your reputation and grow your practice.'}
                {selectedRole === 'student' &&
                  'Discover your perfect university, connect with trusted agents, and plan your study abroad journey with confidence.'}
              </motion.p>
            </div>

            {/* Feature highlights */}
            <div className="space-y-3 w-full max-w-xs">
              {[
                { icon: BookOpen, text: 'Access comprehensive dashboards' },
                { icon: Globe, text: 'Connect with a global community' },
                { icon: Sparkles, text: 'Data-driven insights & analytics' },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-3 text-white/80 text-sm"
                >
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-4 h-4" />
                  </div>
                  <span>{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <p className="text-white/40 text-xs">
            &copy; 2026 EduConnect. Empowering education worldwide.
          </p>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-gray-50">
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">EduConnect</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
            <p className="text-gray-500">Sign in to your account to continue</p>
          </div>

          {/* Role selector tabs */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sign in as
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 p-1 bg-gray-100 rounded-xl">
              {roles.map((role) => {
                const Icon = role.icon;
                const isActive = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? `bg-white shadow-sm ${role.textColor}`
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{role.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="w-4.5 h-4.5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`block w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:${activeRole.ringColor} focus:border-transparent`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-4.5 h-4.5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={`block w-full pl-11 pr-11 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:${activeRole.ringColor} focus:border-transparent`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <button type="button" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                Forgot password?
              </button>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white font-medium text-sm transition-all duration-200 bg-gradient-to-r ${activeRole.color} hover:shadow-lg hover:shadow-primary-500/25 disabled:opacity-70 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Sign up link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              Sign up
            </Link>
          </p>

          {/* Demo credentials hint */}
          <motion.div
            key={selectedRole}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`mt-6 p-4 rounded-xl border ${activeRole.bgLight} ${activeRole.borderColor}/40`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-semibold uppercase tracking-wider ${activeRole.textColor}`}>
                Demo Credentials
              </span>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className={`text-xs font-medium ${activeRole.textColor} hover:underline`}
              >
                Auto-fill
              </button>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-600">
                <span className="font-medium">Email:</span>{' '}
                <code className="px-1.5 py-0.5 bg-white/80 rounded text-xs">
                  {demoCredentials[selectedRole].email}
                </code>
              </p>
              <p className="text-xs text-gray-600">
                <span className="font-medium">Password:</span>{' '}
                <code className="px-1.5 py-0.5 bg-white/80 rounded text-xs">
                  {demoCredentials[selectedRole].password}
                </code>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
