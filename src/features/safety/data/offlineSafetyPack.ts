import type { BarklogDogRow } from '@/api/auth';
import type { MedicationModel } from '@/db';

import {
  FIRST_AID_GUIDES,
  type FirstAidTopicId,
  QUICK_FIRST_AID_TOPICS,
} from './firstAidGuides';
import {
  ASPCA_POISON_CONTROL_PHONE,
  getCommonToxicityHazards,
  PET_POISON_HELPLINE_PHONE,
} from './toxicityDatabase';

export type SafetyContentMetadata = {
  offline_available: boolean;
  reviewed_at: string;
  source: string;
  version: string;
};

export type EmergencyContact = {
  action: 'call' | 'external-search' | 'route';
  label: string;
  phone?: string;
  route?: string;
};

export type EmergencyCard = {
  allergies: string[];
  conditions: string[];
  dogName: string;
  medications: string[];
  profileStatus: 'complete' | 'missing-dog' | 'missing-weight';
  weightLabel: string;
};

export type OfflineSafetyPack = {
  contacts: EmergencyContact[];
  cprTopic: FirstAidTopicId;
  firstAidTopics: FirstAidTopicId[];
  metadata: SafetyContentMetadata[];
  poisonControlAction: EmergencyContact;
  safeTransportChecklist: string[];
  toxicityHazardIds: string[];
};

export const SAFETY_CONTENT_METADATA: SafetyContentMetadata[] = [
  {
    offline_available: true,
    reviewed_at: '2026-04-27',
    source: 'American Red Cross pet first aid',
    version: 'red-cross-dog-first-aid-v1',
  },
  {
    offline_available: true,
    reviewed_at: '2026-04-27',
    source: 'ASPCA Animal Poison Control',
    version: 'aspca-core-toxicity-v1',
  },
  {
    offline_available: true,
    reviewed_at: '2026-04-27',
    source: 'BarkLog local emergency card',
    version: 'local-emergency-card-v1',
  },
];

export const SAFE_TRANSPORT_CHECKLIST = [
  'Call the emergency vet or poison control before leaving when possible.',
  'Bring medication bottles, labels, packaging, or a photo of the item.',
  'Use a carrier, towel, blanket, or leash to limit movement safely.',
  'Keep your dog warm and quiet unless overheating is the concern.',
  'Share weight, timing, symptoms, and recent medications on arrival.',
];

export const OFFLINE_SAFETY_PACK: OfflineSafetyPack = {
  contacts: [
    {
      action: 'call',
      label: 'ASPCA Poison Control',
      phone: ASPCA_POISON_CONTROL_PHONE,
    },
    {
      action: 'call',
      label: 'Pet Poison Helpline',
      phone: PET_POISON_HELPLINE_PHONE,
    },
    {
      action: 'external-search',
      label: 'Find 24/7 Emergency Vet',
    },
  ],
  cprTopic: 'cpr',
  firstAidTopics: QUICK_FIRST_AID_TOPICS,
  metadata: SAFETY_CONTENT_METADATA,
  poisonControlAction: {
    action: 'call',
    label: 'Call Poison Control',
    phone: ASPCA_POISON_CONTROL_PHONE,
  },
  safeTransportChecklist: SAFE_TRANSPORT_CHECKLIST,
  toxicityHazardIds: getCommonToxicityHazards().map((item) => item.id),
};

function formatMedication(medication: MedicationModel) {
  const dose = medication.doseMg ? `${medication.doseMg} mg` : 'dose not set';
  const frequency =
    medication.frequency?.replace(/_/g, ' ') ?? 'schedule not set';

  return `${medication.name}: ${dose}, ${frequency}`;
}

export function buildEmergencyCard(input: {
  dog: BarklogDogRow | null | undefined;
  medications: MedicationModel[];
}): EmergencyCard {
  if (!input.dog) {
    return {
      allergies: ['Not saved in BarkLog yet'],
      conditions: ['Not saved in BarkLog yet'],
      dogName: 'No dog selected',
      medications: ['No active medications loaded'],
      profileStatus: 'missing-dog',
      weightLabel: 'Weight not saved',
    };
  }

  return {
    allergies: ['Not saved in BarkLog yet'],
    conditions: ['Not saved in BarkLog yet'],
    dogName: input.dog.name,
    medications:
      input.medications.length > 0
        ? input.medications.map(formatMedication)
        : ['No active medications saved'],
    profileStatus:
      typeof input.dog.weight_lbs === 'number' ? 'complete' : 'missing-weight',
    weightLabel:
      typeof input.dog.weight_lbs === 'number'
        ? `${input.dog.weight_lbs.toFixed(1)} lb`
        : 'Weight not saved',
  };
}

export function getOfflineFirstAidGuideTitles() {
  return OFFLINE_SAFETY_PACK.firstAidTopics.map(
    (topic) => FIRST_AID_GUIDES[topic].title,
  );
}

export function getSafetyMetadataSummary() {
  return SAFETY_CONTENT_METADATA.map((entry) => entry.source).join(', ');
}
