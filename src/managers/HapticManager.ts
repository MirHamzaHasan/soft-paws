import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

async function runNativeHaptic(feedback: () => Promise<void>) {
  if (Platform.OS === 'web') {
    return;
  }

  await feedback();
}

const HapticManager = {
  error: async (): Promise<void> => {
    await runNativeHaptic(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
    );
  },

  heavy: async (): Promise<void> => {
    await runNativeHaptic(() =>
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
    );
  },

  light: async (): Promise<void> => {
    await runNativeHaptic(() =>
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    );
  },

  medium: async (): Promise<void> => {
    await runNativeHaptic(() =>
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
    );
  },

  selectionChange: async (): Promise<void> => {
    await runNativeHaptic(() => Haptics.selectionAsync());
  },

  success: async (): Promise<void> => {
    await runNativeHaptic(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    );
  },

  warning: async (): Promise<void> => {
    await runNativeHaptic(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
    );
  },
};

export default HapticManager;
