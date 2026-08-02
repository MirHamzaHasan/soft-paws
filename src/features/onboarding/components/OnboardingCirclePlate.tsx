import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

type OnboardingCirclePlateProps = {
  children: ReactNode;
  size?: number;
  onPress?: () => void;
  accessibilityLabel?: string;
  alignSelf?: 'center' | 'flex-start';
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#DDD8D2',
    backgroundColor: '#F6F4F2',
  },
  pressed: {
    opacity: 0.92,
  },
});

export function OnboardingCirclePlate({
  children,
  size = 72,
  onPress,
  accessibilityLabel,
  alignSelf = 'center',
}: OnboardingCirclePlateProps) {
  const dimensionStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    alignSelf,
  };

  if (onPress) {
    return (
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.base,
          dimensionStyle,
          pressed ? styles.pressed : null,
        ]}
        onPress={onPress}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[styles.base, dimensionStyle]}>{children}</View>;
}
