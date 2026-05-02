import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Building2,
  Users,
  UserCheck,
  Newspaper,
} from 'lucide-react';
import useStore from '../../store/useStore';

const navLinks = [
  { name: 'Feed', path: '/', icon: Newspaper },
  { name: 'Universities', path: '/universities', icon: Building2 },
  { name: 'Agents', path: '/agents', icon: Users },
  { name: 'Consultants', path: '/consultants', icon: UserCheck },
];

export default function Navbar() {
  const { currentUser, isAuthenticated, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const isActiveLink = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef(null);

  // Track scroll position for visual enhancement
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    setMobileOpen(false);
    await logout();
    navigate('/login');
  };

  const closeMobile = () => setMobileOpen(false);

  const userInitials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : currentUser?.contactPerson
      ? currentUser.contactPerson
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : 'U';

  const displayName =
    currentUser?.name || currentUser?.contactPerson || 'User';

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 30 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass shadow-lg shadow-black/5'
          : 'bg-white/60 backdrop-blur-md'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group" onClick={closeMobile}>
          <div className="gradient-primary flex h-9 w-9 items-center justify-center rounded-xl shadow-md shadow-primary-500/25 transition-transform duration-200 group-hover:scale-110">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            <span className="text-gradient">Edu</span>
            <span className="text-slate-800">Connect</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isActiveLink(link.path)
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop auth area */}
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated && currentUser ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 shadow-sm transition-all hover:border-primary-300 hover:shadow-md"
              >
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={displayName}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="gradient-primary flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white">
                    {userInitials}
                  </div>
                )}
                <span className="max-w-[120px] truncate text-sm font-medium text-slate-700">
                  {displayName}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                    userMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 origin-top-right overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-black/10"
                  >
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="text-sm font-semibold text-slate-800">
                        {displayName}
                      </p>
                      <p className="mt-0.5 text-xs capitalize text-slate-500">
                        {currentUser.role} Account
                      </p>
                    </div>

                    <div className="p-1.5">
                      <Link
                        to={`/${currentUser.role}`}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition-colors hover:bg-primary-50 hover:text-primary-700"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <Link
                        to={`/${currentUser.role}/profile`}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition-colors hover:bg-primary-50 hover:text-primary-700"
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 p-1.5">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="gradient-primary rounded-lg px-5 py-2 text-sm font-semibold text-white shadow-md shadow-primary-500/25 transition-all hover:shadow-lg hover:shadow-primary-500/30 hover:brightness-110"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100 md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 top-16 z-40 bg-black/20 backdrop-blur-sm md:hidden"
              onClick={closeMobile}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="absolute left-0 right-0 top-16 z-50 overflow-hidden border-b border-slate-200 bg-white shadow-xl md:hidden"
            >
              <div className="space-y-1 px-4 pb-4 pt-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={closeMobile}
                      className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                        isActiveLink(link.path)
                          ? 'bg-primary-50 text-primary-700 border-l-2 border-primary-500'
                          : 'text-slate-700 hover:bg-primary-50 hover:text-primary-700'
                      }`}
                    >
                      {Icon && <Icon className={`h-4 w-4 ${isActiveLink(link.path) ? 'text-primary-500' : 'text-slate-400'}`} />}
                      {link.name}
                    </Link>
                  );
                })}

                <div className="my-2 border-t border-slate-100" />

                {isAuthenticated && currentUser ? (
                  <>
                    <div className="flex items-center gap-3 px-3 py-2">
                      {currentUser.avatar ? (
                        <img
                          src={currentUser.avatar}
                          alt={displayName}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="gradient-primary flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white">
                          {userInitials}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {displayName}
                        </p>
                        <p className="text-xs capitalize text-slate-500">
                          {currentUser.role}
                        </p>
                      </div>
                    </div>

                    <Link
                      to={`/${currentUser.role}`}
                      onClick={closeMobile}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-primary-50 hover:text-primary-700"
                    >
                      <LayoutDashboard className="h-4 w-4 text-slate-400" />
                      Dashboard
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 pt-1">
                    <Link
                      to="/login"
                      onClick={closeMobile}
                      className="rounded-lg border border-slate-200 px-4 py-2.5 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={closeMobile}
                      className="gradient-primary rounded-lg px-4 py-2.5 text-center text-sm font-semibold text-white shadow-md shadow-primary-500/25"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
