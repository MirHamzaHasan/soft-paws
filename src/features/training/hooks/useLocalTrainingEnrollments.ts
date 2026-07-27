import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';

import type { TrainingEnrollmentModel } from '@/db/models';
import { listLocalTrainingEnrollmentsForDog } from '@/db/training';

type LocalTrainingEnrollmentState = {
  enrollments: TrainingEnrollmentModel[];
  error: string | null;
  isLoading: boolean;
  refreshEnrollments: () => Promise<void>;
};

export function useLocalTrainingEnrollments(
  dogId: string | null | undefined,
): LocalTrainingEnrollmentState {
  const [enrollments, setEnrollments] = useState<TrainingEnrollmentModel[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(dogId));
  const [error, setError] = useState<string | null>(null);

  const refreshEnrollments = useCallback(async () => {
    if (!dogId) {
      setEnrollments([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextEnrollments = await listLocalTrainingEnrollmentsForDog(dogId);
      setEnrollments(nextEnrollments);
    } catch (loadError) {
      setEnrollments([]);
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load training progress from this device.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [dogId]);

  useFocusEffect(
    useCallback(() => {
      refreshEnrollments().catch(() => undefined);
    }, [refreshEnrollments]),
  );

  return {
    enrollments,
    error,
    isLoading,
    refreshEnrollments,
  };
}
