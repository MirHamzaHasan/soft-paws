import { File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Share } from 'react-native';

import { shareTextDocument } from '@/features/export/services/exportDocumentService';

const mockQueueBarklogEvent = jest.fn();
const mockCaptureBarklogError = jest.fn();
const mockFileCreate = jest.fn();
const mockFileWrite = jest.fn();

jest.mock('@/features/observability', () => ({
  captureBarklogError: (...args: unknown[]) => mockCaptureBarklogError(...args),
  queueBarklogEvent: (...args: unknown[]) => mockQueueBarklogEvent(...args),
}));

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
  Share: {
    share: jest.fn(async () => ({ action: 'sharedAction' })),
  },
}));

jest.mock('expo-file-system', () => ({
  File: jest
    .fn()
    .mockImplementation((_directory: unknown, fileName: string) => ({
      create: mockFileCreate,
      uri: `file:///cache/${fileName}`,
      write: mockFileWrite,
    })),
  Paths: {
    cache: 'file:///cache/',
    document: 'file:///documents/',
  },
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(async () => true),
  shareAsync: jest.fn(async () => undefined),
}));

jest.mock('expo-print', () => ({
  printAsync: jest.fn(async () => undefined),
  printToFileAsync: jest.fn(async () => ({ uri: 'file:///cache/report.pdf' })),
}));

describe('export document native sharing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('writes text exports to a native file before opening the share sheet', async () => {
    await expect(
      shareTextDocument({
        content: 'name,type\nMilo,walk',
        fileName: 'Milo Walk Export.csv',
        mimeType: 'text/csv',
        title: 'Milo walk export',
        uti: 'public.comma-separated-values-text',
      }),
    ).resolves.toBe('Milo walk export ready to share.');

    expect(File).toHaveBeenCalledWith('file:///cache/', 'Milo-Walk-Export.csv');
    expect(mockFileCreate).toHaveBeenCalledWith({ overwrite: true });
    expect(mockFileWrite).toHaveBeenCalledWith('name,type\nMilo,walk', {
      encoding: 'utf8',
    });
    expect(Sharing.shareAsync).toHaveBeenCalledWith(
      'file:///cache/Milo-Walk-Export.csv',
      {
        UTI: 'public.comma-separated-values-text',
        dialogTitle: 'Milo walk export',
        mimeType: 'text/csv',
      },
    );
    expect(Share.share).not.toHaveBeenCalled();
  });

  it('falls back to the native share API when file sharing is unavailable', async () => {
    jest.mocked(Sharing.isAvailableAsync).mockResolvedValueOnce(false);

    await expect(
      shareTextDocument({
        content: 'plain memory text',
        fileName: 'memory.txt',
        mimeType: 'text/plain',
        title: 'Memory Book',
        uti: 'public.plain-text',
      }),
    ).resolves.toBe('Memory Book ready to share.');

    expect(Share.share).toHaveBeenCalledWith({
      message: 'plain memory text',
      title: 'Memory Book',
    });
  });
});
