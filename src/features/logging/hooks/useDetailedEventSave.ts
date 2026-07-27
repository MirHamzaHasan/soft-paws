import { useState } from 'react';

import { useBarklogFeedback } from '@/components/ui';
import {
  type BarklogEventType,
  createLocalEvent,
  type CreateLocalEventInput,
} from '@/db';
import {
  captureBarklogError,
  queueBarklogEvent,
} from '@/features/observability';
import HapticManager from '@/managers/HapticManager';
import { getSelectedDog, useAuthSessionStore } from '@/stores';
import type { Json } from '@/types/supabase';
import { getBarklogErrorMessage } from '@/utils/barklogErrorMessages';

export type DetailWhenValue = 'earlier' | 'just-now';

export const DETAIL_WHEN_OPTIONS = [
  { label: 'Just now', value: 'just-now' },
  { label: 'Earlier', value: 'earlier' },
] as const;

type DetailedEventInput = {
  details: Json;
  notes?: string | null;
  occurredAt: number;
  photoUrl?: string | null;
  type: BarklogEventType;
};

export function resolveDetailWhenTimestamp(when: DetailWhenValue) {
  if (when === 'earlier') {
    return Date.now() - 60 * 60 * 1000;
  }

  return Date.now();
}

export function parseOptionalNumber(value: string) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
}

export function normalizeOptionalText(value: string) {
  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
}

export function createLocalAttachmentUri(type: BarklogEventType) {
  return `local://barklog/${type}/${Date.now()}`;
}

export function useDetailedEventSave() {
  const feedback = useBarklogFeedback();
  const barklogUser = useAuthSessionStore((state) => state.barklogUser);
  const dogs = useAuthSessionStore((state) => state.dogs);
  const selectedDogId = useAuthSessionStore((state) => state.selectedDogId);
  const selectedDog = getSelectedDog(dogs, selectedDogId);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const saveEvent = async (input: DetailedEventInput) => {
    if (!barklogUser?.id || !selectedDog?.id) {
      const missingContextMessage =
        'Complete BarkLog onboarding before saving detailed events.';
      setError(missingContextMessage);
      await HapticManager.warning();
      throw new Error(missingContextMessage);
    }

    setError(null);
    setIsSaving(true);

    try {
      const eventInput = {
        ...input,
        dogId: selectedDog.id,
        loggedAt: Date.now(),
        source: 'detail',
        synced: false,
        userId: barklogUser.id,
      } satisfies CreateLocalEventInput;

      const savedEvent = await createLocalEvent(eventInput);

      queueBarklogEvent('detail_log_saved', {
        dog_id: selectedDog.id,
        event_type: input.type,
      });
      await HapticManager.success();
      feedback.showSuccess({
        title: 'Event saved',
        description: 'Saved locally and added to Timeline.',
      });

      return savedEvent;
    } catch (saveError) {
      const message = getBarklogErrorMessage(saveError, {
        domain: 'local_save',
      });
      setError(message);
      queueBarklogEvent('detail_log_failed', {
        dog_id: selectedDog.id,
        event_type: input.type,
      });
      captureBarklogError(saveError, {
        extra: {
          dog_id: selectedDog.id,
          event_type: input.type,
        },
        source: 'logging.detail_save',
      });
      await HapticManager.error();
      throw saveError;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    canSave: Boolean(barklogUser?.id && selectedDog?.id),
    error,
    isSaving,
    primaryDog: selectedDog,
    saveEvent,
  };
}
