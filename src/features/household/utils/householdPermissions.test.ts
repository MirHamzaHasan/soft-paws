import {
  canMemberPerform,
  getDefaultHouseholdPermissions,
  getHouseholdRoleLabel,
  getSitterExpiryDate,
  isSitterAccessActive,
  roleHasHouseholdPermission,
} from './householdPermissions';

describe('householdPermissions', () => {
  const now = new Date('2026-04-27T12:00:00.000Z');

  it('gives owners every household permission', () => {
    expect(roleHasHouseholdPermission('owner', 'manage_members')).toBe(true);
    expect(roleHasHouseholdPermission('owner', 'create_logs')).toBe(true);
    expect(getDefaultHouseholdPermissions('owner')).toContain('view_reports');
  });

  it('keeps caregivers able to help without managing members', () => {
    expect(roleHasHouseholdPermission('caregiver', 'create_logs')).toBe(true);
    expect(roleHasHouseholdPermission('caregiver', 'manage_medications')).toBe(
      true,
    );
    expect(roleHasHouseholdPermission('caregiver', 'manage_members')).toBe(
      false,
    );
  });

  it('keeps viewers read-only', () => {
    expect(roleHasHouseholdPermission('viewer', 'view_logs')).toBe(true);
    expect(roleHasHouseholdPermission('viewer', 'create_logs')).toBe(false);
    expect(roleHasHouseholdPermission('viewer', 'manage_medications')).toBe(
      false,
    );
  });

  it('expires sitter access after the sitter window', () => {
    const expiresAt = '2026-04-27T11:59:59.000Z';

    expect(isSitterAccessActive(expiresAt, now)).toBe(false);
    expect(
      canMemberPerform(
        {
          permissions: getDefaultHouseholdPermissions('sitter'),
          role: 'sitter',
          sitter_expires_at: expiresAt,
        },
        'create_logs',
        now,
      ),
    ).toBe(false);
  });

  it('allows active sitters to create logs but not reports', () => {
    expect(
      canMemberPerform(
        {
          permissions: getDefaultHouseholdPermissions('sitter'),
          role: 'sitter',
          sitter_expires_at: '2026-04-28T12:00:00.000Z',
        },
        'create_logs',
        now,
      ),
    ).toBe(true);
    expect(
      canMemberPerform(
        {
          permissions: getDefaultHouseholdPermissions('sitter'),
          role: 'sitter',
          sitter_expires_at: '2026-04-28T12:00:00.000Z',
        },
        'view_reports',
        now,
      ),
    ).toBe(false);
  });

  it('labels roles and computes sitter expiration dates', () => {
    expect(getHouseholdRoleLabel('sitter')).toBe('Sitter');
    expect(getSitterExpiryDate(2, now)).toBe('2026-04-29T12:00:00.000Z');
  });
});
