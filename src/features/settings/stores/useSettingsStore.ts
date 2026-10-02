import { create } from 'zustand';

import { settingsStorage } from './settingsStorage';

export type BarklogAppearancePreference = 'light' | 'system';
export type BarklogUnitsPreference = 'imperial' | 'metric';

type BarklogSettingsState = {
  anomalyAlertsEnabled: boolean;
  appearance: BarklogAppearancePreference;
  healthDataConnected: boolean;
  medicationRemindersEnabled: boolean;
  resetSettings: () => void;
  setAnomalyAlertsEnabled: (enabled: boolean) => void;
  setAppearance: (appearance: BarklogAppearancePreference) => void;
  setHealthDataConnected: (connected: boolean) => void;
  setMedicationRemindersEnabled: (enabled: boolean) => void;
  setUnits: (units: BarklogUnitsPreference) => void;
  units: BarklogUnitsPreference;
};

type BarklogPersistedSettings = Pick<
  BarklogSettingsState,
  | 'anomalyAlertsEnabled'
  | 'appearance'
  | 'healthDataConnected'
  | 'medicationRemindersEnabled'
  | 'units'
>;

const SETTINGS_STORAGE_KEY = 'barklog-settings';

const defaultSettings: BarklogPersistedSettings = {
  anomalyAlertsEnabled: true,
  appearance: 'system',
  healthDataConnected: false,
  medicationRemindersEnabled: true,
  units: 'imperial',
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const readPersistedSettings = (): Partial<BarklogPersistedSettings> => {
  try {
    const rawSettings = settingsStorage.getItem(SETTINGS_STORAGE_KEY);

    if (!rawSettings) {
      return {};
    }

    const parsedSettings: unknown = JSON.parse(rawSettings);

    if (!isRecord(parsedSettings)) {
      return {};
    }

    const source = isRecord(parsedSettings.state)
      ? parsedSettings.state
      : parsedSettings;
    const settings: Partial<BarklogPersistedSettings> = {};

    if (typeof source.anomalyAlertsEnabled === 'boolean') {
      settings.anomalyAlertsEnabled = source.anomalyAlertsEnabled;
    }

    if (source.appearance === 'light' || source.appearance === 'system') {
      settings.appearance = source.appearance;
    }

    if (typeof source.healthDataConnected === 'boolean') {
      settings.healthDataConnected = source.healthDataConnected;
    }

    if (typeof source.medicationRemindersEnabled === 'boolean') {
      settings.medicationRemindersEnabled = source.medicationRemindersEnabled;
    }

    if (source.units === 'imperial' || source.units === 'metric') {
      settings.units = source.units;
    }

    return settings;
  } catch {
    return {};
  }
};

const pickPersistedSettings = (
  state: BarklogSettingsState,
): BarklogPersistedSettings => ({
  anomalyAlertsEnabled: state.anomalyAlertsEnabled,
  appearance: state.appearance,
  healthDataConnected: state.healthDataConnected,
  medicationRemindersEnabled: state.medicationRemindersEnabled,
  units: state.units,
});

const persistSettings = (settings: BarklogPersistedSettings) => {
  try {
    settingsStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ state: settings, version: 0 }),
    );
  } catch {
    // Storage may be unavailable during early web boot or private browsing.
  }
};

const persistNextSettings = (
  state: BarklogSettingsState,
  nextSettings: Partial<BarklogPersistedSettings>,
) => {
  persistSettings({ ...pickPersistedSettings(state), ...nextSettings });

  return nextSettings;
};

export const useSettingsStore = create<BarklogSettingsState>()((set) => ({
  ...defaultSettings,
  ...readPersistedSettings(),
  resetSettings: () =>
    set((state) => persistNextSettings(state, defaultSettings)),
  setAnomalyAlertsEnabled: (anomalyAlertsEnabled) =>
    set((state) => persistNextSettings(state, { anomalyAlertsEnabled })),
  setAppearance: (appearance) =>
    set((state) => persistNextSettings(state, { appearance })),
  setHealthDataConnected: (healthDataConnected) =>
    set((state) => persistNextSettings(state, { healthDataConnected })),
  setMedicationRemindersEnabled: (medicationRemindersEnabled) =>
    set((state) => persistNextSettings(state, { medicationRemindersEnabled })),
  setUnits: (units) => set((state) => persistNextSettings(state, { units })),
}));
