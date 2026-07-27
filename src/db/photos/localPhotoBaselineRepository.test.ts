import { getBarklogDatabase } from '@/db/database';
import {
  createLocalPhotoBaseline,
  createPhotoBaselineAttachmentUri,
  deleteLocalPhotoBaseline,
} from '@/db/photos';
import { mergeBarklogSyncMetadata } from '@/db/sync';

import { createWatermelonWriteHarness } from '../../../test/utils/watermelon';

jest.mock('@/db/database', () => ({
  getBarklogDatabase: jest.fn(),
}));

jest.mock('@/db/sync', () => ({
  mergeBarklogSyncMetadata: jest.fn(),
}));

type LocalPhotoBaselineWriteRecord = {
  bodyArea?: string | null;
  capturedAt?: number;
  category?: string;
  createdAt?: number;
  dogId?: string;
  markAsDeleted?: jest.Mock;
  notes?: string | null;
  photoUri?: string | null;
  title?: string;
  userId?: string;
};

const getBarklogDatabaseMock = jest.mocked(getBarklogDatabase);
const mergeBarklogSyncMetadataMock = jest.mocked(mergeBarklogSyncMetadata);

describe('local photo baseline repository', () => {
  const now = Date.parse('2026-04-27T10:00:00.000Z');

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(now);
    mergeBarklogSyncMetadataMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates local photo baselines before sync', async () => {
    const { database, record } =
      createWatermelonWriteHarness<LocalPhotoBaselineWriteRecord>();

    getBarklogDatabaseMock.mockReturnValue(
      database as unknown as ReturnType<typeof getBarklogDatabase>,
    );

    const photoBaseline = await createLocalPhotoBaseline({
      bodyArea: '  left ear ',
      capturedAt: new Date('2026-04-26T08:00:00.000Z'),
      category: 'skin',
      dogId: 'dog-1',
      notes: '  Owner noticed a small color change. ',
      photoUri: ' local-photo://baseline/skin/1 ',
      title: ' Left ear reference ',
      userId: 'user-1',
    });

    expect(photoBaseline).toBe(record);
    expect(database.get).toHaveBeenCalledWith('photo_baselines');
    expect(record).toMatchObject({
      bodyArea: 'left ear',
      capturedAt: Date.parse('2026-04-26T08:00:00.000Z'),
      category: 'skin',
      createdAt: now,
      dogId: 'dog-1',
      notes: 'Owner noticed a small color change.',
      photoUri: 'local-photo://baseline/skin/1',
      title: 'Left ear reference',
      userId: 'user-1',
    });
    expect(mergeBarklogSyncMetadataMock).toHaveBeenCalledWith(database, {
      lastLocalWriteAt: now,
    });
  });

  it('marks local photo baselines deleted before sync', async () => {
    const record: LocalPhotoBaselineWriteRecord = {
      markAsDeleted: jest.fn(async () => undefined),
    };
    const collection = {
      find: jest.fn(async () => record),
    };
    const database = {
      get: jest.fn(() => collection),
      localStorage: {
        get: jest.fn(async () => undefined),
        set: jest.fn(async () => undefined),
      },
      write: jest.fn(async (work: () => unknown) => work()),
    };

    getBarklogDatabaseMock.mockReturnValue(
      database as unknown as ReturnType<typeof getBarklogDatabase>,
    );

    await deleteLocalPhotoBaseline('photo-baseline-1');

    expect(collection.find).toHaveBeenCalledWith('photo-baseline-1');
    expect(record.markAsDeleted).toHaveBeenCalled();
    expect(mergeBarklogSyncMetadataMock).toHaveBeenCalledWith(database, {
      lastLocalWriteAt: now,
    });
  });

  it('creates deterministic local placeholder URIs for future native capture', () => {
    expect(createPhotoBaselineAttachmentUri('teeth')).toBe(
      `local-photo://baseline/teeth/${now}`,
    );
  });
});
