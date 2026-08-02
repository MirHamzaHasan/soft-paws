import { type ReactNode, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

type BarklogBottomSheetProps = {
  accessibilityLabel: string;
  children: ReactNode;
  onClose: () => void;
  open: boolean;
};

const useNativeDriver = Platform.OS !== 'web';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 10, 0.32)',
  },
  card: {
    width: '100%',
    maxWidth: 448,
    alignSelf: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 0,
    borderColor: '#D7D3CF',
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
    gap: 18,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C9C5C1',
  },
});

export function BarklogBottomSheet({
  accessibilityLabel,
  children,
  onClose,
  open,
}: BarklogBottomSheetProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(32)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then(setReduceMotion)
      .catch(() => undefined);

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    opacity.setValue(0);
    translateY.setValue(reduceMotion ? 0 : 32);

    const fade = Animated.timing(opacity, {
      duration: reduceMotion ? 100 : 180,
      easing: Easing.out(Easing.cubic),
      toValue: 1,
      useNativeDriver,
    });
    const rise = Animated.spring(translateY, {
      damping: 24,
      mass: 0.8,
      stiffness: 260,
      toValue: 0,
      useNativeDriver,
    });

    Animated.parallel(reduceMotion ? [fade] : [fade, rise]).start();
  }, [open, opacity, reduceMotion, translateY]);

  return (
    <Modal
      transparent
      animationType="none"
      statusBarTranslucent
      visible={open}
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity }]}>
          <Pressable
            accessibilityLabel="Close sheet"
            accessibilityRole="button"
            style={StyleSheet.absoluteFill}
            onPress={onClose}
          />
        </Animated.View>

        <Animated.View
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="menu"
          style={[
            styles.card,
            {
              opacity,
              transform: reduceMotion ? undefined : [{ translateY }],
            },
          ]}
        >
          <View style={styles.handle} />
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}
