export const BARKLOG_STORAGE_BUCKETS = {
  dogPhotos: 'dog-photos',
  eventPhotos: 'event-photos',
  expenseReceipts: 'expense-receipts',
  vaccinationRecords: 'vaccination-records',
} as const;

export const BARKLOG_SIGNED_URL_TTL_SECONDS = 60 * 60 * 24;

type DogScopedPathInput = {
  userId: string;
  dogId: string;
  fileName: string;
};

type EventScopedPathInput = DogScopedPathInput & {
  eventId: string;
};

type ExpenseScopedPathInput = DogScopedPathInput & {
  expenseId: string;
};

type VaccinationScopedPathInput = DogScopedPathInput & {
  vaccinationId: string;
};

function sanitizeFileName(fileName: string) {
  return fileName
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .toLowerCase();
}

export function buildDogPhotoPath({
  userId,
  dogId,
  fileName,
}: DogScopedPathInput) {
  return `${userId}/${dogId}/${sanitizeFileName(fileName)}`;
}

export function buildEventPhotoPath({
  userId,
  dogId,
  eventId,
  fileName,
}: EventScopedPathInput) {
  return `${userId}/${dogId}/${eventId}/${sanitizeFileName(fileName)}`;
}

export function buildExpenseReceiptPath({
  userId,
  dogId,
  expenseId,
  fileName,
}: ExpenseScopedPathInput) {
  return `${userId}/${dogId}/${expenseId}/${sanitizeFileName(fileName)}`;
}

export function buildVaccinationRecordPath({
  userId,
  dogId,
  vaccinationId,
  fileName,
}: VaccinationScopedPathInput) {
  return `${userId}/${dogId}/${vaccinationId}/${sanitizeFileName(fileName)}`;
}
