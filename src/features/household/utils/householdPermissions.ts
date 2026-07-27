export type HouseholdRole = 'caregiver' | 'owner' | 'sitter' | 'viewer';

export type HouseholdPermission =
  | 'create_logs'
  | 'edit_own_logs'
  | 'manage_medications'
  | 'manage_members'
  | 'view_logs'
  | 'view_reports';

export type HouseholdMemberPermissionState = {
  permissions: HouseholdPermission[];
  role: HouseholdRole;
  sitter_expires_at?: string | null;
};

const ROLE_PERMISSIONS: Record<HouseholdRole, HouseholdPermission[]> = {
  caregiver: [
    'view_logs',
    'create_logs',
    'edit_own_logs',
    'manage_medications',
    'view_reports',
  ],
  owner: [
    'view_logs',
    'create_logs',
    'edit_own_logs',
    'manage_medications',
    'view_reports',
    'manage_members',
  ],
  sitter: ['view_logs', 'create_logs', 'edit_own_logs'],
  viewer: ['view_logs', 'view_reports'],
};

const roleLabels: Record<HouseholdRole, string> = {
  caregiver: 'Caregiver',
  owner: 'Owner',
  sitter: 'Sitter',
  viewer: 'Viewer',
};

export function getDefaultHouseholdPermissions(role: HouseholdRole) {
  return [...ROLE_PERMISSIONS[role]];
}

export function roleHasHouseholdPermission(
  role: HouseholdRole,
  permission: HouseholdPermission,
) {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function isSitterAccessActive(
  expiresAt: string | null | undefined,
  now = new Date(),
) {
  if (!expiresAt) {
    return true;
  }

  const expiresAtMs = new Date(expiresAt).getTime();

  return Number.isFinite(expiresAtMs) && expiresAtMs > now.getTime();
}

export function canMemberPerform(
  member: HouseholdMemberPermissionState | null | undefined,
  permission: HouseholdPermission,
  now = new Date(),
) {
  if (!member) {
    return false;
  }

  if (
    member.role === 'sitter' &&
    !isSitterAccessActive(member.sitter_expires_at, now)
  ) {
    return false;
  }

  if (member.role === 'owner') {
    return true;
  }

  return member.permissions.includes(permission);
}

export function getHouseholdRoleLabel(role: HouseholdRole) {
  return roleLabels[role];
}

export function getSitterExpiryDate(daysFromNow = 2, now = new Date()) {
  return new Date(now.getTime() + daysFromNow * 86_400_000).toISOString();
}
