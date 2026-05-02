import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, Bell, Globe, Save } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

function Toggle({ enabled, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>
        {description && (
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
          enabled ? 'bg-indigo-600' : 'bg-slate-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

export default function AdminSettings() {
  const [platformName, setPlatformName] = useState('EduConnect');
  const [contactEmail, setContactEmail] = useState('contact@educonnect.com');
  const [supportEmail, setSupportEmail] = useState('support@educonnect.com');

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);

  const [passwordRequirements, setPasswordRequirements] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowSignups, setAllowSignups] = useState(true);

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} custom={0}>
        <h1 className="text-2xl font-bold text-slate-900">Platform Settings</h1>
        <p className="text-slate-500 mt-1">
          Manage your platform configuration, notifications, and security preferences.
        </p>
      </motion.div>

      {/* General Settings */}
      <motion.div
        variants={fadeInUp}
        custom={1}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-indigo-100 p-2.5 rounded-xl">
            <Settings className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">General Settings</h2>
            <p className="text-sm text-slate-500">Basic platform information</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="platformName" className="block text-sm font-medium text-slate-700 mb-1">
              Platform Name
            </label>
            <input
              id="platformName"
              type="text"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-slate-700 mb-1">
                Contact Email
              </label>
              <input
                id="contactEmail"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="supportEmail" className="block text-sm font-medium text-slate-700 mb-1">
                Support Email
              </label>
              <input
                id="supportEmail"
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        variants={fadeInUp}
        custom={2}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-amber-100 p-2.5 rounded-xl">
            <Bell className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
            <p className="text-sm text-slate-500">Configure how you receive alerts</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          <Toggle
            enabled={emailNotifications}
            onChange={setEmailNotifications}
            label="Email Notifications"
            description="Send email alerts for important platform events"
          />
          <Toggle
            enabled={systemAlerts}
            onChange={setSystemAlerts}
            label="System Alerts"
            description="Show in-app notifications for system updates"
          />
        </div>
      </motion.div>

      {/* Security */}
      <motion.div
        variants={fadeInUp}
        custom={3}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-emerald-100 p-2.5 rounded-xl">
            <Shield className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Security</h2>
            <p className="text-sm text-slate-500">Authentication and access controls</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          <Toggle
            enabled={passwordRequirements}
            onChange={setPasswordRequirements}
            label="Strong Password Requirements"
            description="Require minimum 8 characters, uppercase, lowercase, and numbers"
          />
          <Toggle
            enabled={twoFactorAuth}
            onChange={setTwoFactorAuth}
            label="Two-Factor Authentication"
            description="Require 2FA for all admin accounts"
          />
          <div className="py-3">
            <label htmlFor="sessionTimeout" className="block text-sm font-medium text-slate-900">
              Session Timeout (minutes)
            </label>
            <p className="text-xs text-slate-500 mt-0.5 mb-2">
              Automatically log out inactive users after this period
            </p>
            <input
              id="sessionTimeout"
              type="number"
              min="5"
              max="1440"
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              className="w-32 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
            />
          </div>
        </div>
      </motion.div>

      {/* Platform */}
      <motion.div
        variants={fadeInUp}
        custom={4}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-violet-100 p-2.5 rounded-xl">
            <Globe className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Platform</h2>
            <p className="text-sm text-slate-500">Control platform availability and access</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          <Toggle
            enabled={maintenanceMode}
            onChange={setMaintenanceMode}
            label="Maintenance Mode"
            description="Temporarily disable the platform for maintenance"
          />
          <Toggle
            enabled={allowSignups}
            onChange={setAllowSignups}
            label="Allow New Signups"
            description="Allow new users to register on the platform"
          />
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div variants={fadeInUp} custom={5} className="flex justify-end">
        <button
          onClick={handleSave}
          className="gradient-primary inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary-500/25 transition-all hover:shadow-lg hover:brightness-110 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
        >
          <Save className="w-4 h-4" />
          {saved ? 'Settings Saved!' : 'Save Settings'}
        </button>
      </motion.div>
    </motion.div>
  );
}
