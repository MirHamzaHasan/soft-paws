import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BarklogToast } from './BarklogToast';

type BarklogFeedbackTone = 'danger' | 'success' | 'warning';

export type BarklogFeedbackInput = {
  description?: string;
  title: string;
};

type BarklogFeedbackToast = BarklogFeedbackInput & {
  id: number;
  tone: BarklogFeedbackTone;
};

type BarklogFeedbackContextValue = {
  showError: (input: BarklogFeedbackInput) => void;
  showSuccess: (input: BarklogFeedbackInput) => void;
  showWarning: (input: BarklogFeedbackInput) => void;
};

const noop = () => {};

const BarklogFeedbackContext = createContext<BarklogFeedbackContextValue>({
  showError: noop,
  showSuccess: noop,
  showWarning: noop,
});

const toastDurations: Record<BarklogFeedbackTone, number> = {
  danger: 4000,
  success: 2200,
  warning: 4000,
};

const useNativeDriver = Platform.OS !== 'web';

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  toastCard: {
    maxWidth: 560,
    width: '100%',
  },
  toastWrap: {
    alignItems: 'center',
    left: 16,
    position: 'absolute',
    right: 16,
    zIndex: 1000,
  },
});

function FeedbackToastHost({
  onHide,
  toast,
}: {
  onHide: (toastId: number) => void;
  toast: BarklogFeedbackToast | null;
}) {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.98)).current;
  const translateY = useRef(new Animated.Value(10)).current;
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);

  useEffect(() => {
    let isMounted = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (isMounted) {
          setReduceMotionEnabled(enabled);
        }
      })
      .catch(() => undefined);

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotionEnabled,
    );

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    opacity.setValue(0);
    scale.setValue(reduceMotionEnabled ? 1 : 0.98);
    translateY.setValue(reduceMotionEnabled ? 0 : 10);

    const showAnimations = [
      Animated.timing(opacity, {
        toValue: 1,
        duration: reduceMotionEnabled ? 100 : 160,
        easing: Easing.out(Easing.cubic),
        useNativeDriver,
      }),
    ];

    if (!reduceMotionEnabled) {
      showAnimations.push(
        Animated.spring(translateY, {
          toValue: 0,
          damping: 22,
          mass: 0.7,
          stiffness: 260,
          useNativeDriver,
        }),
        Animated.spring(scale, {
          toValue: 1,
          damping: 22,
          mass: 0.7,
          stiffness: 260,
          useNativeDriver,
        }),
      );
    }

    Animated.parallel(showAnimations).start();

    const timeout = setTimeout(() => {
      const hideAnimations = [
        Animated.timing(opacity, {
          toValue: 0,
          duration: reduceMotionEnabled ? 100 : 140,
          easing: Easing.in(Easing.cubic),
          useNativeDriver,
        }),
      ];

      if (!reduceMotionEnabled) {
        hideAnimations.push(
          Animated.timing(translateY, {
            toValue: 8,
            duration: 140,
            easing: Easing.in(Easing.cubic),
            useNativeDriver,
          }),
        );
      }

      Animated.parallel(hideAnimations).start(({ finished }) => {
        if (finished) {
          onHide(toast.id);
        }
      });
    }, toastDurations[toast.tone]);

    return () => {
      clearTimeout(timeout);
    };
  }, [onHide, opacity, reduceMotionEnabled, scale, toast, translateY]);

  if (!toast) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.toastWrap,
        {
          bottom: Math.max(insets.bottom, 12) + 86,
          opacity,
          transform: reduceMotionEnabled
            ? undefined
            : [{ translateY }, { scale }],
        },
      ]}
    >
      <Pressable
        accessibilityLabel={`Dismiss notification: ${toast.title}`}
        accessibilityRole="button"
        style={styles.toastCard}
        onPress={() => onHide(toast.id)}
      >
        <BarklogToast
          title={toast.title}
          description={toast.description}
          tone={toast.tone}
        />
      </Pressable>
    </Animated.View>
  );
}

export function BarklogFeedbackProvider({ children }: { children: ReactNode }) {
  const toastIdRef = useRef(0);
  const [toast, setToast] = useState<BarklogFeedbackToast | null>(null);

  const show = useCallback(
    (tone: BarklogFeedbackTone, input: BarklogFeedbackInput) => {
      toastIdRef.current += 1;
      setToast({
        id: toastIdRef.current,
        tone,
        ...input,
      });
    },
    [],
  );

  const handleHide = useCallback((toastId: number) => {
    setToast((currentToast) =>
      currentToast?.id === toastId ? null : currentToast,
    );
  }, []);

  const value = useMemo(
    () => ({
      showError: (input: BarklogFeedbackInput) => show('danger', input),
      showSuccess: (input: BarklogFeedbackInput) => show('success', input),
      showWarning: (input: BarklogFeedbackInput) => show('warning', input),
    }),
    [show],
  );

  return (
    <BarklogFeedbackContext.Provider value={value}>
      <View style={styles.root}>
        {children}
        <FeedbackToastHost toast={toast} onHide={handleHide} />
      </View>
    </BarklogFeedbackContext.Provider>
  );
}

export function useBarklogFeedback() {
  return useContext(BarklogFeedbackContext);
}
