import * as LucideIcons from 'lucide-react-native';
import { colors } from '../theme';

// Thin wrapper so the rest of the app never imports lucide-react-native
// directly — swapping icon libraries later stays a one-file change.
export default function Icon({ name, size = 20, color = colors.slate700, strokeWidth = 2, style }) {
  const Cmp = LucideIcons[name];
  if (!Cmp) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn(`Icon "${name}" not found in lucide-react-native`);
    }
    return null;
  }
  return <Cmp size={size} color={color} strokeWidth={strokeWidth} style={style} />;
}
