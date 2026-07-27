import {
  getPhotoBaselineCategoryOption,
  isPhotoBaselineCategory,
} from './photoBaseline';

describe('photo baseline category contract', () => {
  it('guards supported photo baseline categories', () => {
    expect(isPhotoBaselineCategory('skin')).toBe(true);
    expect(isPhotoBaselineCategory('mobility_posture')).toBe(true);
    expect(isPhotoBaselineCategory('cat')).toBe(false);
  });

  it('returns fallback metadata when needed', () => {
    expect(getPhotoBaselineCategoryOption('other')).toMatchObject({
      emoji: '📷',
      label: 'Other',
    });
  });
});
