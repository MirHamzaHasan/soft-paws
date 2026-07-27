export type PhotoBaselineCategory =
  | 'skin'
  | 'eyes'
  | 'teeth'
  | 'stool'
  | 'weight_shape'
  | 'mobility_posture'
  | 'wound'
  | 'grooming'
  | 'other';

export type PhotoBaselineCategoryOption = {
  description: string;
  emoji: string;
  label: string;
  value: PhotoBaselineCategory;
};

export const PHOTO_BASELINE_CATEGORY_OPTIONS = [
  {
    description: 'Skin, coat, bumps, or owner-observed surface changes.',
    emoji: '🧴',
    label: 'Skin',
    value: 'skin',
  },
  {
    description: 'Eye appearance references for future comparison.',
    emoji: '👁️',
    label: 'Eyes',
    value: 'eyes',
  },
  {
    description: 'Teeth and gum visual references.',
    emoji: '🦷',
    label: 'Teeth',
    value: 'teeth',
  },
  {
    description: 'Stool photo references connected to care observations.',
    emoji: '💩',
    label: 'Stool',
    value: 'stool',
  },
  {
    description: 'Body shape and weight-context references.',
    emoji: '⚖️',
    label: 'Body shape',
    value: 'weight_shape',
  },
  {
    description: 'Standing, sitting, gait, or posture references.',
    emoji: '🐾',
    label: 'Posture',
    value: 'mobility_posture',
  },
  {
    description: 'Owner-observed wound or recovery references.',
    emoji: '🩹',
    label: 'Wound',
    value: 'wound',
  },
  {
    description: 'Grooming before-and-after or coat-care references.',
    emoji: '🛁',
    label: 'Grooming',
    value: 'grooming',
  },
  {
    description: 'Anything else worth saving as a dated photo reference.',
    emoji: '📷',
    label: 'Other',
    value: 'other',
  },
] as const satisfies readonly PhotoBaselineCategoryOption[];

const photoBaselineCategoryValues = new Set<PhotoBaselineCategory>(
  PHOTO_BASELINE_CATEGORY_OPTIONS.map((option) => option.value),
);
const fallbackPhotoBaselineCategoryOption =
  PHOTO_BASELINE_CATEGORY_OPTIONS[PHOTO_BASELINE_CATEGORY_OPTIONS.length - 1]!;

export function isPhotoBaselineCategory(
  value: string,
): value is PhotoBaselineCategory {
  return photoBaselineCategoryValues.has(value as PhotoBaselineCategory);
}

export function getPhotoBaselineCategoryOption(
  category: PhotoBaselineCategory,
) {
  return (
    PHOTO_BASELINE_CATEGORY_OPTIONS.find(
      (option) => option.value === category,
    ) ?? fallbackPhotoBaselineCategoryOption
  );
}
