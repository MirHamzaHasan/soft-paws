import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { queueBarklogEvent } from '@/features/observability';

export type BarklogNativeCapability =
  | 'camera'
  | 'health_activity'
  | 'location'
  | 'notifications';

export type NativeCapabilityStatus =
  | 'denied'
  | 'granted'
  | 'not_configured'
  | 'unsupported';

export type NativeCapabilityResult = {
  message: string;
  status: NativeCapabilityStatus;
};

export function getHealthActivityCapabilityLabel() {
  if (Platform.OS === 'ios') {
    return 'Apple Health';
  }

  if (Platform.OS === 'android') {
    return 'Google Fit';
  }

  return 'health activity';
}

async function requestNotificationPermission(): Promise<NativeCapabilityResult> {
  if (Platform.OS === 'web') {
    return {
      message:
        'Medication reminders are saved, but browser notification scheduling is not available in this Expo web preview.',
      status: 'unsupported',
    };
  }

  try {
    const existingPermissions = await Notifications.getPermissionsAsync();

    if (existingPermissions.granted) {
      return {
        message: 'Notifications are enabled for BarkLog reminders.',
        status: 'granted',
      };
    }

    const requestedPermissions = await Notifications.requestPermissionsAsync();

    if (requestedPermissions.granted) {
      return {
        message: 'Notifications are enabled for BarkLog reminders.',
        status: 'granted',
      };
    }

    return {
      message:
        'Notifications are off. BarkLog will still save reminders locally.',
      status: 'denied',
    };
  } catch {
    return {
      message: 'Notification permissions are unavailable in this environment.',
      status: 'unsupported',
    };
  }
}

function getUnsupportedCapabilityResult(
  capability: Exclude<BarklogNativeCapability, 'notifications'>,
): NativeCapabilityResult {
  if (capability === 'health_activity') {
    return {
      message: `${getHealthActivityCapabilityLabel()} import is opt-in and needs the native activity adapter before it can connect. BarkLog will not request health data in this build.`,
      status: Platform.OS === 'web' ? 'unsupported' : 'not_configured',
    };
  }

  if (capability === 'camera') {
    return {
      message:
        'Camera access is not configured in this build. BarkLog will request it only after photo capture or toxicity scanning is connected.',
      status: Platform.OS === 'web' ? 'unsupported' : 'not_configured',
    };
  }

  return {
    message:
      'Location access is not configured in this build. Nearby clinic search opens maps without requesting BarkLog location permission.',
    status: Platform.OS === 'web' ? 'unsupported' : 'not_configured',
  };
}

export async function requestNativeCapability(
  capability: BarklogNativeCapability,
): Promise<NativeCapabilityResult> {
  queueBarklogEvent('permission_requested', {
    capability,
  });

  const result =
    capability === 'notifications'
      ? await requestNotificationPermission()
      : getUnsupportedCapabilityResult(capability);

  queueBarklogEvent('permission_result', {
    capability,
    status: result.status,
  });

  return result;
}
