import { makePhotoBaselineModel } from '../../../../test/utils/builders';
import {
  formatPhotoBaselineCapturedLabel,
  formatPhotoBaselineDateInput,
  getPhotoBaselineLabel,
  getSafePhotoBaselineCategory,
  normalizePhotoBaselineDateInput,
  sortPhotoBaselinesNewestFirst,
} from './photoBaselinePresentation';

describe('photo baseline presentation helpers', () => {
  it('normalizes flexible captured date input to timestamps', () => {
    expect(normalizePhotoBaselineDateInput('2026-04-26')).toBe(
      Date.parse('2026-04-26T00:00:00.000Z'),
    );
    expect(normalizePhotoBaselineDateInput('not a date')).toBeNull();
    expect(normalizePhotoBaselineDateInput('')).toBeNull();
  });

  it('formats date inputs with stable yyyy-mm-dd values', () => {
    expect(
      formatPhotoBaselineDateInput(new Date('2026-04-06T10:00:00.000Z')),
    ).toBe('2026-04-06');
  });

  it('formats captured labels and safe category labels', () => {
    expect(
      formatPhotoBaselineCapturedLabel(Date.parse('2026-04-26T08:00:00.000Z')),
    ).toBe('Apr 26, 2026');
    expect(getPhotoBaselineLabel('mobility_posture')).toBe('Posture');
    expect(getSafePhotoBaselineCategory('unknown')).toBe('other');
  });

  it('sorts baselines newest-first by captured date and created time', () => {
    const oldest = makePhotoBaselineModel({
      capturedAt: Date.parse('2026-04-20T08:00:00.000Z'),
      createdAt: Date.parse('2026-04-20T08:01:00.000Z'),
      id: 'oldest',
    });
    const newest = makePhotoBaselineModel({
      capturedAt: Date.parse('2026-04-27T08:00:00.000Z'),
      createdAt: Date.parse('2026-04-27T08:01:00.000Z'),
      id: 'newest',
    });
    const laterCreated = makePhotoBaselineModel({
      capturedAt: Date.parse('2026-04-27T08:00:00.000Z'),
      createdAt: Date.parse('2026-04-27T09:01:00.000Z'),
      id: 'later-created',
    });

    expect(
      sortPhotoBaselinesNewestFirst([oldest, newest, laterCreated]),
    ).toEqual([laterCreated, newest, oldest]);
  });
});
