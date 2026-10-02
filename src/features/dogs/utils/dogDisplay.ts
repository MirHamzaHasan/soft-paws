import type { BarklogDogRow } from '@/api/localProfile';

const DOG_AVATAR_COLORS = [
  '#173136',
  '#16202C',
  '#6D4B2F',
  '#3D4D5C',
  '#5D4635',
] as const;

const DOG_AVATAR_EMOJIS = ['🐶', '🐕', '🐾', '🦴', '🐩'] as const;

export function formatDogMeta(dog: BarklogDogRow | null | undefined) {
  const breedLabel = dog?.breed?.trim() || 'Dog';
  const birthdate = dog?.birthdate;

  if (!birthdate) {
    return breedLabel;
  }

  const today = new Date();
  const dob = new Date(birthdate);

  if (Number.isNaN(dob.getTime())) {
    return breedLabel;
  }

  const months =
    (today.getFullYear() - dob.getFullYear()) * 12 +
    (today.getMonth() - dob.getMonth());

  if (months < 12) {
    return `${breedLabel} • ${Math.max(months, 0)} mos`;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (remainingMonths <= 0) {
    return `${breedLabel} • ${years}y`;
  }

  return `${breedLabel} • ${years}y ${remainingMonths}m`;
}

export function formatDogWeight(dog: BarklogDogRow | null | undefined) {
  return typeof dog?.weight_lbs === 'number'
    ? `${dog.weight_lbs.toFixed(1)} lbs`
    : 'Not set';
}

export function getDogAvatar(dog: BarklogDogRow, index = 0) {
  const nameSeed = dog.name.charCodeAt(0) || index;
  const avatarIndex = Math.abs(nameSeed + index) % DOG_AVATAR_EMOJIS.length;
  const colorIndex = Math.abs(nameSeed + index) % DOG_AVATAR_COLORS.length;

  return {
    backgroundColor: DOG_AVATAR_COLORS[colorIndex] ?? DOG_AVATAR_COLORS[0],
    emoji: DOG_AVATAR_EMOJIS[avatarIndex] ?? DOG_AVATAR_EMOJIS[0],
  };
}

export function formatDogCreatedAt(dog: BarklogDogRow) {
  if (!dog.created_at) {
    return 'Profile ready';
  }

  const createdAt = new Date(dog.created_at);

  if (Number.isNaN(createdAt.getTime())) {
    return 'Profile ready';
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    year: 'numeric',
  }).format(createdAt);
}
