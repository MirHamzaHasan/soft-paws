import {
  AnalyticsManager,
  CrashReportingManager,
  StorageManager,
} from '../../managers';
import type { Manager } from './managerRegistry';

// Mapping IDs to actual Manager instances
// Note: Some managers might need to be created/wrapped to match the Manager interface
export const managerInstances: Record<string, any> = {
  // ads: AdsManager,
  // notifications: NotificationManager,
  analytics: AnalyticsManager,
  crashReporting: CrashReportingManager,
  storage: StorageManager,
  // purchases: IAPManager,
  // ... other managers would be added here
};

export const registerManagers = async (activeConfigs: { id: string }[]) => {
  const registered: Manager[] = [];

  for (const config of activeConfigs) {
    const instance = managerInstances[config.id];
    if (instance) {
      registered.push(instance);
    }
  }

  return registered;
};
