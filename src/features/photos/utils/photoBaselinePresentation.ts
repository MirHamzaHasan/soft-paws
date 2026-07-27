import type { PhotoBaselineModel } from '@/db';
import {
  getPhotoBaselineCategoryOption,
  isPhotoBaselineCategory,
  type PhotoBaselineCategory,
} from '@/types/photoBaseline';

export function normalizePhotoBaselineDateInput(input: string) {
  const trimmed = input.trim();

  if (!trimmed) {
    return null;
  }

  const parsed = new Date(trimmed);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.getTime();
}

export function formatPhotoBaselineDateInput(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function formatPhotoBaselineCapturedLabel(capturedAt: number) {
  const date = new Date(capturedAt);

  if (Number.isNaN(date.getTime())) {
    return 'Date saved';
  }

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function getSafePhotoBaselineCategory(
  category: string,
): PhotoBaselineCategory {
  return isPhotoBaselineCategory(category) ? category : 'other';
}

export function getPhotoBaselineLabel(category: string) {
  return getPhotoBaselineCategoryOption(getSafePhotoBaselineCategory(category))
    .label;
}

export function sortPhotoBaselinesNewestFirst(baselines: PhotoBaselineModel[]) {
  return [...baselines].sort((first, second) => {
    const capturedDelta = second.capturedAt - first.capturedAt;

    if (capturedDelta !== 0) {
      return capturedDelta;
    }

    return second.createdAt - first.createdAt;
  });
}
