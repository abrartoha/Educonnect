import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Globe,
  MessageCircle,
  Heart,
  ExternalLink,
  BookOpen,
  MapPin,
  Mail,
  Send,
} from 'lucide-react';
import { useState } from 'react';

const platformLinks = [
  { name: 'Browse Universities', path: '/universities' },
  { name: 'Find an Agent', path: '/agents' },
  { name: 'Find a Consultant', path: '/consultants' },
  { name: 'Compare Programs', path: '/compare' },
  { name: 'Scholarships', path: '/scholarships' },
];

const resourceLinks = [
  { name: 'Study in Australia Guide', path: '/resources/study-guide' },
  { name: 'Visa Information', path: '/resources/visa-info' },
  { name: 'Student Blog', path: '/blog' },
  { name: 'FAQs', path: '/faq' },
  { name: 'Support Centre', path: '/support' },
];

const companyLinks = [
  { name: 'About Us', path: '/about' },
  { name: 'Careers', path: '/careers' },
  { name: 'Partner With Us', path: '/partners' },
  { name: 'Press & Media', path: '/press' },
  { name: 'Contact', path: '/contact' },
];

const legalLinks = [
  { name: 'Privacy Policy', path: '/privacy' },
  { name: 'Terms of Service', path: '/terms' },
  { name: 'Cookie Policy', path: '/cookies' },
  { name: 'Accessibility', path: '/accessibility' },
];

const socialLinks = [
  { name: 'Home', icon: Globe, to: '/' },
  { name: 'Community Feed', icon: MessageCircle, to: '/' },
  { name: 'Support', icon: Heart, to: '/support' },
  { name: 'Partners', icon: ExternalLink, to: '/partners' },
  { name: 'Resources', icon: BookOpen, to: '/resources/study-guide' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="relative mt-auto">
      {/* Gradient top border */}
      <div className="h-1 w-full bg-gradient-to-r from-primary-500 via-purple-500 to-accent-500" />

      <div className="bg-slate-900 text-slate-300">
        {/* Main footer content */}
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:gap-12 lg:grid-cols-6">
            {/* Brand column */}
            <div className="lg:col-span-2">
              <Link to="/" className="inline-flex items-center gap-2.5 group">
                <div className="gradient-primary flex h-10 w-10 items-center justify-center rounded-xl shadow-lg shadow-primary-500/20 transition-transform duration-200 group-hover:scale-110">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">
                  <span className="text-primary-400">Edu</span>
                  <span className="text-white">Connect</span>
                </span>
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
                Connecting international students with Australia's top
                universities, trusted agents, and expert consultants. Your
                journey to world-class education starts here.
              </p>

              {/* Made in Australia badge */}
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-4 py-2">
                <MapPin className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-medium text-slate-300">
                  Made with pride in Australia
                </span>
              </div>

              {/* Quick links */}
              <div className="mt-6 flex gap-2">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <Link
                      key={social.name}
                      to={social.to}
                      aria-label={social.name}
                      title={social.name}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-400 transition-all hover:bg-primary-600 hover:text-white hover:shadow-lg hover:shadow-primary-500/20"
                    >
                      <Icon className="h-4 w-4" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Link columns */}
            <div className="grid grid-cols-2 gap-4 sm:gap-8 sm:grid-cols-4 lg:col-span-4">
              <div>
                <h3 className="text-sm font-semibold tracking-wide text-white">
                  Platform
                </h3>
                <ul className="mt-4 space-y-3">
                  {platformLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.path}
                        className="text-sm text-slate-400 transition-colors hover:text-primary-400"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold tracking-wide text-white">
                  Resources
                </h3>
                <ul className="mt-4 space-y-3">
                  {resourceLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.path}
                        className="text-sm text-slate-400 transition-colors hover:text-primary-400"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold tracking-wide text-white">
                  Company
                </h3>
                <ul className="mt-4 space-y-3">
                  {companyLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.path}
                        className="text-sm text-slate-400 transition-colors hover:text-primary-400"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold tracking-wide text-white">
                  Legal
                </h3>
                <ul className="mt-4 space-y-3">
                  {legalLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.path}
                        className="text-sm text-slate-400 transition-colors hover:text-primary-400"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="mt-12 rounded-2xl border border-slate-800 bg-slate-800/50 p-6 sm:flex sm:items-center sm:justify-between sm:p-8">
            <div className="sm:max-w-md">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary-400" />
                <h3 className="text-base font-semibold text-white">
                  Stay Updated
                </h3>
              </div>
              <p className="mt-1 text-sm text-slate-400">
                Get the latest university news, scholarship alerts, and
                education tips delivered to your inbox.
              </p>
            </div>
            <form
              onSubmit={handleSubscribe}
              className="mt-4 flex flex-col sm:flex-row gap-2 sm:mt-0 sm:ml-8 sm:flex-shrink-0"
            >
              <div className="relative flex-1 sm:w-64">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <button
                type="submit"
                className="gradient-primary flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 transition-all hover:shadow-xl hover:shadow-primary-500/30 hover:brightness-110"
              >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Subscribe</span>
              </button>
            </form>
            {subscribed && (
              <p className="mt-2 text-xs font-medium text-emerald-400 sm:mt-0 sm:ml-4">
                Subscribed successfully!
              </p>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} EduConnect Australia. All rights
              reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link
                to="/privacy"
                className="text-xs text-slate-500 transition-colors hover:text-slate-300"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="text-xs text-slate-500 transition-colors hover:text-slate-300"
              >
                Terms
              </Link>
              <Link
                to="/cookies"
                className="text-xs text-slate-500 transition-colors hover:text-slate-300"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
