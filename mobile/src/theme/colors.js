// Canonical palette extracted from the design reference.
// Soft-lavender background, deep-violet primary, generous neutrals.
export const colors = {
  // Primary (violet / indigo)
  primary50: '#F3F1FF',
  primary100: '#E9E4FF',
  primary200: '#D6CCFF',
  primary300: '#B7A7FF',
  primary400: '#9D87F5',
  primary500: '#7B61FF',
  primary600: '#6D4DE6',
  primary700: '#5B3CC4',
  primary800: '#46309C',
  primary900: '#2E1E6B',

  // Accent (slightly warmer violet for the lighter half of gradients)
  accent400: '#A78BFA',
  accent500: '#8B5CF6',

  // Role badges
  roleAdmin: '#8B5CF6',
  roleUniversity: '#7C3AED',
  roleAgent: '#10B981',
  roleConsultant: '#F97316',
  roleStudent: '#A855F7',

  // Neutrals — soft lavender background like the reference
  bg: '#F5F3FC',
  surface: '#FFFFFF',
  surfaceAlt: '#FBFAFF',

  // Slate — unchanged Tailwind scale, used for text + borders
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1E293B',
  slate900: '#0F172A',

  border: '#E5E0F0',
  borderSoft: '#ECE8F7',

  // Status
  success: '#10B981',
  successSoft: '#ECFDF5',
  warning: '#F59E0B',
  warningSoft: '#FEF3C7',
  danger: '#EF4444',
  dangerSoft: '#FEF2F2',
  info: '#3B82F6',
  infoSoft: '#EFF6FF',

  white: '#FFFFFF',
  black: '#000000',

  // Semantic text
  text: '#0F172A',
  textMuted: '#64748B',
  textSubtle: '#94A3B8',
  textOnPrimary: '#FFFFFF',
};

// Two-stop gradients used throughout the design.
export const gradients = {
  primary: ['#7B61FF', '#A78BFA'],           // primary buttons + FAB + hero
  hero: ['#6D4DE6', '#9D87F5'],              // hero cards (slightly deeper)
  heroSoft: ['#8B5CF6', '#A78BFA'],
  scholarships: ['#FB923C', '#F87171'],       // orange → coral
  visa: ['#3B82F6', '#60A5FA'],               // blue
  courses: ['#8B5CF6', '#A855F7'],            // purple
  campus: ['#10B981', '#14B8A6'],             // teal
  career: ['#F59E0B', '#FB923C'],
  studentLife: ['#EC4899', '#F472B6'],
  events: ['#06B6D4', '#38BDF8'],
  // Dashboard tile accents
  tileBlue: ['#60A5FA', '#818CF8'],
  tileAmber: ['#FCD34D', '#FB923C'],
  tileGreen: ['#34D399', '#10B981'],
  tileRose: ['#FB7185', '#F97316'],
  tilePurple: ['#A78BFA', '#8B5CF6'],
};
