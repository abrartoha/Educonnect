import { forwardRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Icon from './Icon';
import { colors, radius, spacing, typography } from '../theme';

const Input = forwardRef(function Input(
  {
    label,
    value,
    onChangeText,
    placeholder,
    error,
    secureTextEntry,
    autoCapitalize = 'none',
    autoCorrect = false,
    keyboardType,
    style,
    onSubmitEditing,
    returnKeyType,
    multiline = false,
    numberOfLines,
    testID,
    icon,
  },
  ref
) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.fieldWrap,
          focused && styles.focused,
          error && styles.errored,
          multiline && { minHeight: Math.max(100, (numberOfLines || 4) * 22), alignItems: 'flex-start' },
        ]}
      >
        {icon ? (
          <Icon
            name={icon}
            size={18}
            color={focused ? colors.primary600 : colors.slate400}
            style={{ marginRight: 10 }}
          />
        ) : null}
        <TextInput
          ref={ref}
          testID={testID}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.slate400}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          keyboardType={keyboardType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          style={[styles.input, multiline && { textAlignVertical: 'top', paddingTop: 10 }]}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.md },
  label: {
    ...typography.caption,
    color: colors.slate700,
    fontWeight: '700',
    marginBottom: 6,
  },
  fieldWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.slate900,
    paddingVertical: 12,
  },
  focused: {
    borderColor: colors.primary500,
    shadowColor: colors.primary500,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 1,
  },
  errored: { borderColor: colors.danger },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginTop: 4,
  },
});

export default Input;
