import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import Icon from './Icon';
import { colors, radius } from '../theme';

// Rounded-square icon holder. Accepts a solid `bg` colour OR a `gradient`
// two-stop array for the gradient category tiles.
export default function IconSquare({
  name,
  size = 44,
  iconSize,
  color = colors.primary600,
  bg = colors.primary100,
  gradient,
  style,
}) {
  const _iconSize = iconSize || Math.round(size * 0.5);
  if (gradient) {
    return (
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.square,
          { width: size, height: size, borderRadius: radius.md },
          style,
        ]}
      >
        <Icon name={name} size={_iconSize} color={colors.white} />
      </LinearGradient>
    );
  }
  return (
    <View
      style={[
        styles.square,
        { width: size, height: size, borderRadius: radius.md, backgroundColor: bg },
        style,
      ]}
    >
      <Icon name={name} size={_iconSize} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  square: { alignItems: 'center', justifyContent: 'center' },
});
