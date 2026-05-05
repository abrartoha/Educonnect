import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  Users,
  UserCheck,
  BarChart3,
  Settings,
  UserCircle,
  Megaphone,
  GraduationCap,
  Newspaper,
  X,
} from 'lucide-react';
import useStore from '../../store/useStore';

const menuByRole = {
  admin: [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Universities', path: '/admin/universities', icon: Building2 },
    { name: 'Agents', path: '/admin/agents', icon: Users },
    { name: 'Consultants', path: '/admin/consultants', icon: UserCheck },
    { name: 'Posts', path: '/admin/posts', icon: Newspaper },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ],
  university: [
    { name: 'Dashboard', path: '/university', icon: LayoutDashboard },
    { name: 'Profile', path: '/university/profile', icon: UserCircle },
    { name: 'Posts', path: '/university/posts', icon: Newspaper },
    { name: 'Campaigns', path: '/university/campaigns', icon: Megaphone },
    { name: 'Analytics', path: '/university/analytics', icon: BarChart3 },
  ],
  agent: [
    { name: 'Dashboard', path: '/agent', icon: LayoutDashboard },
    { name: 'Profile', path: '/agent/profile', icon: UserCircle },
    { name: 'Posts', path: '/agent/posts', icon: Newspaper },
    { name: 'Analytics', path: '/agent/analytics', icon: BarChart3 },
  ],
  consultant: [
    { name: 'Dashboard', path: '/consultant', icon: LayoutDashboard },
    { name: 'Profile', path: '/consultant/profile', icon: UserCircle },
    { name: 'Posts', path: '/consultant/posts', icon: Newspaper },
    { name: 'Analytics', path: '/consultant/analytics', icon: BarChart3 },
  ],
  student: [
    { name: 'Dashboard', path: '/student', icon: LayoutDashboard },
    { name: 'Profile', path: '/student/profile', icon: UserCircle },
    { name: 'Universities', path: '/universities', icon: Building2 },
    { name: 'Agents', path: '/agents', icon: Users },
    { name: 'Feed', path: '/feed', icon: Newspaper },
  ],
};

export default function Sidebar({ isOpen, onClose }) {
  const { currentUser } = useStore();
  const location = useLocation();

  const role = currentUser?.role || 'agent';
  const menuItems = menuByRole[role] || menuByRole.agent;

  const basePath = `/${role === 'admin' ? 'admin' : role}`;
  const isActive = (path) => {
    if (path === basePath) return location.pathname === basePath;
    return location.pathname.startsWith(path);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Sidebar header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
        <div className="flex items-center gap-2.5">
          <div className="gradient-primary flex h-8 w-8 items-center justify-center rounded-lg">
            <GraduationCap className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight">
            <span className="text-gradient">Edu</span>
            <span className="text-slate-800">Connect</span>
          </span>
        </div>
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Role badge */}
      <div className="px-5 pt-5 pb-2">
        <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold capitalize text-primary-700">
          {role} Panel
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {/* Active left indicator */}
              {active && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary-600"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}

              <Icon
                className={`h-[18px] w-[18px] flex-shrink-0 transition-colors ${
                  active
                    ? 'text-primary-600'
                    : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom user info */}
      {currentUser && (
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name || currentUser.contactPerson}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-white"
              />
            ) : (
              <div className="gradient-primary flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ring-2 ring-white">
                {(currentUser.name || currentUser.contactPerson || 'U')
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">
                {currentUser.name || currentUser.contactPerson || 'User'}
              </p>
              <p className="truncate text-xs text-slate-500">
                {currentUser.email || ''}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-16 hidden h-[calc(100vh-4rem)] w-[280px] border-r border-slate-200 bg-white lg:block">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar with overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={onClose}
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 z-50 h-full w-full sm:w-[280px] bg-white shadow-2xl lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
