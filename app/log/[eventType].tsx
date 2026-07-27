import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';

import LogBehaviorDetailScreen from '@/features/logging/screens/LogBehaviorDetailScreen';
import LogExpandedCareDetailScreen from '@/features/logging/screens/LogExpandedCareDetailScreen';
import LogMealDetailScreen from '@/features/logging/screens/LogMealDetailScreen';
import LogMedicationDetailScreen from '@/features/logging/screens/LogMedicationDetailScreen';
import LogMoodDetailScreen from '@/features/logging/screens/LogMoodDetailScreen';
import LogPeeDetailScreen from '@/features/logging/screens/LogPeeDetailScreen';
import LogPoopDetailScreen from '@/features/logging/screens/LogPoopDetailScreen';
import LogWalkDetailScreen from '@/features/logging/screens/LogWalkDetailScreen';
import { isExpandedCareEventType } from '@/types/events';

export default function LogEventTypeRoute() {
  const router = useRouter();
  const { eventType } = useLocalSearchParams<{
    eventType?: string | string[];
  }>();
  const normalizedEventType = Array.isArray(eventType)
    ? eventType[0]
    : eventType;

  useEffect(() => {
    if (
      normalizedEventType &&
      normalizedEventType !== 'poop' &&
      normalizedEventType !== 'pee' &&
      normalizedEventType !== 'meal' &&
      normalizedEventType !== 'walk' &&
      normalizedEventType !== 'medication' &&
      normalizedEventType !== 'mood' &&
      normalizedEventType !== 'behavior' &&
      !isExpandedCareEventType(normalizedEventType)
    ) {
      router.replace('/(tabs)');
    }
  }, [normalizedEventType, router]);

  if (!normalizedEventType) {
    return null;
  }

  if (normalizedEventType === 'poop') {
    return <LogPoopDetailScreen />;
  }

  if (normalizedEventType === 'pee') {
    return <LogPeeDetailScreen />;
  }

  if (normalizedEventType === 'meal') {
    return <LogMealDetailScreen />;
  }

  if (normalizedEventType === 'walk') {
    return <LogWalkDetailScreen />;
  }

  if (normalizedEventType === 'medication') {
    return <LogMedicationDetailScreen />;
  }

  if (normalizedEventType === 'mood') {
    return <LogMoodDetailScreen />;
  }

  if (normalizedEventType === 'behavior') {
    return <LogBehaviorDetailScreen />;
  }

  if (isExpandedCareEventType(normalizedEventType)) {
    return <LogExpandedCareDetailScreen eventType={normalizedEventType} />;
  }

  return null;
}
