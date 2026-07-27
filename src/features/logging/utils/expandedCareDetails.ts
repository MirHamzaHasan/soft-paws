import {
  type AppetiteValue,
  type CoughSneezeFrequency,
  type CoughSneezeType,
  type DentalAction,
  type ExpandedCareEventType,
  isAppetiteValue,
  isCoughSneezeFrequency,
  isCoughSneezeType,
  isDentalAction,
  isMobilityObservation,
  isObservationSeverity,
  isParasitePreventionType,
  isRestQuality,
  isVetVisitType,
  isVomitAppearance,
  isVomitFrequency,
  isWaterSource,
  type MobilityObservation,
  type ObservationSeverity,
  type ParasitePreventionType,
  type RestQuality,
  type VetVisitType,
  type VomitAppearance,
  type VomitFrequency,
  type WaterSource,
} from '@/types/events';
import type { Json } from '@/types/supabase';

export type ExpandedCareFormState = {
  amountOz: string;
  appetite: AppetiteValue;
  coughSneezeFrequency: CoughSneezeFrequency;
  coughSneezeType: CoughSneezeType;
  dentalAction: DentalAction;
  mobilityObservation: MobilityObservation;
  mobilitySeverity: ObservationSeverity | null;
  parasitePreventionType: ParasitePreventionType;
  parasiteProductName: string;
  restDurationMin: string;
  restQuality: RestQuality;
  vetClinicName: string;
  vetVisitType: VetVisitType;
  vomitAppearance: VomitAppearance;
  vomitFrequency: VomitFrequency;
  waterSource: WaterSource;
};

export const defaultExpandedCareFormState: ExpandedCareFormState = {
  amountOz: '',
  appetite: 'normal',
  coughSneezeFrequency: 'once',
  coughSneezeType: 'cough',
  dentalAction: 'brushing',
  mobilityObservation: 'normal',
  mobilitySeverity: null,
  parasitePreventionType: 'flea_tick',
  parasiteProductName: '',
  restDurationMin: '',
  restQuality: 'settled',
  vetClinicName: '',
  vetVisitType: 'wellness',
  vomitAppearance: 'unknown',
  vomitFrequency: 'once',
  waterSource: 'bowl',
};

function asDetailsRecord(value: Json | null | undefined) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, Json | undefined>;
}

export function parseOptionalPositiveNumber(value: string) {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export function normalizeDetailsText(value: string) {
  const normalized = value.trim();

  return normalized.length > 0 ? normalized : undefined;
}

export function getExpandedCareFormStateFromDetails(
  eventType: ExpandedCareEventType,
  details: Json | null | undefined,
): ExpandedCareFormState {
  const record = asDetailsRecord(details);
  const state = { ...defaultExpandedCareFormState };

  if (eventType === 'water') {
    state.amountOz =
      typeof record.amount_oz === 'number' ? String(record.amount_oz) : '';
    state.waterSource = isWaterSource(record.source)
      ? record.source
      : state.waterSource;
  }

  if (eventType === 'rest') {
    state.restDurationMin =
      typeof record.duration_min === 'number'
        ? String(record.duration_min)
        : '';
    state.restQuality = isRestQuality(record.quality)
      ? record.quality
      : state.restQuality;
  }

  if (eventType === 'vomit') {
    state.vomitAppearance = isVomitAppearance(record.appearance)
      ? record.appearance
      : state.vomitAppearance;
    state.vomitFrequency = isVomitFrequency(record.frequency)
      ? record.frequency
      : state.vomitFrequency;
  }

  if (eventType === 'cough_sneeze') {
    state.coughSneezeType = isCoughSneezeType(record.type)
      ? record.type
      : state.coughSneezeType;
    state.coughSneezeFrequency = isCoughSneezeFrequency(record.frequency)
      ? record.frequency
      : state.coughSneezeFrequency;
  }

  if (eventType === 'mobility') {
    state.mobilityObservation = isMobilityObservation(record.observation)
      ? record.observation
      : state.mobilityObservation;
    state.mobilitySeverity = isObservationSeverity(record.severity)
      ? record.severity
      : null;
  }

  if (eventType === 'appetite') {
    state.appetite = isAppetiteValue(record.appetite)
      ? record.appetite
      : state.appetite;
  }

  if (eventType === 'dental') {
    state.dentalAction = isDentalAction(record.action)
      ? record.action
      : state.dentalAction;
  }

  if (eventType === 'parasite_prevention') {
    state.parasitePreventionType = isParasitePreventionType(
      record.prevention_type,
    )
      ? record.prevention_type
      : state.parasitePreventionType;
    state.parasiteProductName =
      typeof record.product_name === 'string' ? record.product_name : '';
  }

  if (eventType === 'vet_visit') {
    state.vetVisitType = isVetVisitType(record.visit_type)
      ? record.visit_type
      : state.vetVisitType;
    state.vetClinicName =
      typeof record.clinic_name === 'string' ? record.clinic_name : '';
  }

  return state;
}

export function buildExpandedCareDetails(
  eventType: ExpandedCareEventType,
  state: ExpandedCareFormState,
): Json {
  if (eventType === 'water') {
    return {
      amount_oz: parseOptionalPositiveNumber(state.amountOz),
      source: state.waterSource,
    };
  }

  if (eventType === 'rest') {
    return {
      duration_min: parseOptionalPositiveNumber(state.restDurationMin),
      quality: state.restQuality,
    };
  }

  if (eventType === 'vomit') {
    return {
      appearance: state.vomitAppearance,
      frequency: state.vomitFrequency,
    };
  }

  if (eventType === 'cough_sneeze') {
    return {
      frequency: state.coughSneezeFrequency,
      type: state.coughSneezeType,
    };
  }

  if (eventType === 'mobility') {
    return {
      observation: state.mobilityObservation,
      severity: state.mobilitySeverity ?? undefined,
    };
  }

  if (eventType === 'appetite') {
    return {
      appetite: state.appetite,
    };
  }

  if (eventType === 'dental') {
    return {
      action: state.dentalAction,
    };
  }

  if (eventType === 'parasite_prevention') {
    return {
      prevention_type: state.parasitePreventionType,
      product_name: normalizeDetailsText(state.parasiteProductName),
    };
  }

  return {
    clinic_name: normalizeDetailsText(state.vetClinicName),
    visit_type: state.vetVisitType,
  };
}
