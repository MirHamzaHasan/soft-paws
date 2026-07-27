import moduleRegistry from './module-registry.json';

export interface ManagerConfig {
  id: string;
  enabled: boolean;
  priority: number; // For initialization order
}

export const APP_MANAGERS: ManagerConfig[] = [
  { id: 'storage', enabled: moduleRegistry.storage, priority: 1 },
  { id: 'auth', enabled: moduleRegistry.auth, priority: 2 },
  { id: 'analytics', enabled: moduleRegistry.analytics, priority: 3 },
  { id: 'remoteConfig', enabled: moduleRegistry.remoteConfig, priority: 4 },
  { id: 'localization', enabled: moduleRegistry.localization, priority: 5 },
  { id: 'theme', enabled: moduleRegistry.theme, priority: 6 },
  { id: 'consent', enabled: moduleRegistry.consent, priority: 7 },
  { id: 'ads', enabled: moduleRegistry.ads, priority: 8 },
  { id: 'notifications', enabled: moduleRegistry.notifications, priority: 9 },
  { id: 'purchases', enabled: moduleRegistry.purchases, priority: 10 },
  { id: 'deepLinks', enabled: moduleRegistry.deepLinks, priority: 11 },
  {
    id: 'crashReporting',
    enabled: moduleRegistry.crashReporting,
    priority: 12,
  },
];
