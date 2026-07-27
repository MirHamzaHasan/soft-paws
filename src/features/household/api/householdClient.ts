import { getSupabaseClient } from '@/api';
import type { BarklogDogRow, BarklogUserRow } from '@/api/auth';
import type { Database, Json } from '@/types/supabase';

import {
  buildHouseholdInviteUrl,
  createHouseholdInviteToken,
  getHouseholdInviteExpiresAt,
  hashHouseholdInviteToken,
} from '../utils/householdInviteTokens';
import {
  getDefaultHouseholdPermissions,
  getSitterExpiryDate,
  type HouseholdRole,
} from '../utils/householdPermissions';

export type HouseholdRow = Database['public']['Tables']['households']['Row'];
export type HouseholdMemberRow =
  Database['public']['Tables']['household_members']['Row'];
export type HouseholdDogRow =
  Database['public']['Tables']['household_dogs']['Row'];
export type HouseholdInviteRow =
  Database['public']['Tables']['household_invites']['Row'];
export type CareHandoffRow =
  Database['public']['Tables']['care_handoffs']['Row'];

export type HouseholdOverviewData = {
  dogs: BarklogDogRow[];
  handoffs: CareHandoffRow[];
  householdDogs: HouseholdDogRow[];
  households: HouseholdRow[];
  invites: HouseholdInviteRow[];
  memberships: HouseholdMemberRow[];
};

export type CreateHouseholdInviteInput = {
  dogIds: string[];
  email: string;
  householdId: string;
  inviterUserId: string;
  role: Exclude<HouseholdRole, 'owner'>;
};

export type CreatedHouseholdInvite = {
  expiresAt: string;
  id: string;
  token: string;
  url: string;
};

function toJsonPermissions(role: HouseholdRole) {
  return getDefaultHouseholdPermissions(role) as unknown as Json;
}

function uniqueIds(ids: string[]) {
  return Array.from(new Set(ids.filter(Boolean)));
}

export async function listHouseholdOverview(userId: string) {
  const supabase = getSupabaseClient();
  const { data: memberships, error: membershipError } = await supabase
    .from('household_members')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (membershipError) {
    throw new Error('Unable to load household membership.');
  }

  const householdIds = uniqueIds(
    (memberships ?? []).map((membership) => membership.household_id),
  );

  if (householdIds.length === 0) {
    return {
      dogs: [],
      handoffs: [],
      householdDogs: [],
      households: [],
      invites: [],
      memberships: [],
    } satisfies HouseholdOverviewData;
  }

  const [
    householdsResult,
    allMembersResult,
    householdDogsResult,
    invitesResult,
    handoffsResult,
  ] = await Promise.all([
    supabase.from('households').select('*').in('id', householdIds),
    supabase
      .from('household_members')
      .select('*')
      .in('household_id', householdIds)
      .order('created_at', { ascending: true }),
    supabase
      .from('household_dogs')
      .select('*')
      .in('household_id', householdIds),
    supabase
      .from('household_invites')
      .select('*')
      .in('household_id', householdIds)
      .is('accepted_at', null)
      .is('revoked_at', null)
      .order('created_at', { ascending: false }),
    supabase
      .from('care_handoffs')
      .select('*')
      .in('household_id', householdIds)
      .order('created_at', { ascending: false }),
  ]);

  const firstError =
    householdsResult.error ??
    allMembersResult.error ??
    householdDogsResult.error ??
    invitesResult.error ??
    handoffsResult.error;

  if (firstError) {
    throw new Error('Unable to load household sharing data.');
  }

  const dogIds = uniqueIds(
    (householdDogsResult.data ?? []).map((householdDog) => householdDog.dog_id),
  );
  let dogs: BarklogDogRow[] = [];

  if (dogIds.length > 0) {
    const { data, error } = await supabase
      .from('dogs')
      .select('*')
      .in('id', dogIds);

    if (error) {
      throw new Error('Unable to load shared dog profiles.');
    }

    dogs = data ?? [];
  }

  return {
    dogs,
    handoffs: handoffsResult.data ?? [],
    householdDogs: householdDogsResult.data ?? [],
    households: householdsResult.data ?? [],
    invites: invitesResult.data ?? [],
    memberships: allMembersResult.data ?? memberships ?? [],
  } satisfies HouseholdOverviewData;
}

export async function createHousehold(input: {
  dogs: BarklogDogRow[];
  name: string;
  user: BarklogUserRow;
}) {
  const supabase = getSupabaseClient();
  const { data: household, error: householdError } = await supabase
    .from('households')
    .insert({
      name: input.name,
      owner_user_id: input.user.id,
    })
    .select('*')
    .single();

  if (householdError || !household) {
    throw new Error('Unable to create a household right now.');
  }

  const { error: memberError } = await supabase
    .from('household_members')
    .insert({
      email: input.user.email,
      household_id: household.id,
      permissions: toJsonPermissions('owner'),
      role: 'owner',
      user_id: input.user.id,
    });

  if (memberError) {
    throw new Error('Unable to create your household owner record.');
  }

  const dogRows = input.dogs.map((dog) => ({
    added_by_user_id: input.user.id,
    dog_id: dog.id,
    household_id: household.id,
  }));

  if (dogRows.length > 0) {
    const { error: dogError } = await supabase
      .from('household_dogs')
      .insert(dogRows);

    if (dogError) {
      throw new Error('Unable to add dogs to this household.');
    }
  }

  return household;
}

export async function createHouseholdInvite(input: CreateHouseholdInviteInput) {
  const token = await createHouseholdInviteToken();
  const tokenHash = await hashHouseholdInviteToken(token);
  const expiresAt = getHouseholdInviteExpiresAt();
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('household_invites')
    .insert({
      dog_ids: input.dogIds as unknown as Json,
      email: input.email.trim().toLowerCase(),
      expires_at: expiresAt,
      household_id: input.householdId,
      inviter_user_id: input.inviterUserId,
      permissions: toJsonPermissions(input.role),
      role: input.role,
      token_hash: tokenHash,
    })
    .select('id, expires_at')
    .single();

  if (error || !data) {
    throw new Error('Unable to create this household invite.');
  }

  return {
    expiresAt: data.expires_at,
    id: data.id,
    token,
    url: buildHouseholdInviteUrl(token),
  } satisfies CreatedHouseholdInvite;
}

export async function acceptHouseholdInvite(token: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke(
    'accept-household-invite',
    {
      body: {
        token,
      },
    },
  );

  if (error) {
    throw new Error('Unable to accept this household invite.');
  }

  return data as { householdId: string; membershipId: string };
}

export async function revokeHouseholdInvite(inviteId: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('household_invites')
    .update({
      revoked_at: new Date().toISOString(),
    })
    .eq('id', inviteId);

  if (error) {
    throw new Error('Unable to revoke this household invite.');
  }
}

export async function removeHouseholdMember(memberId: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('household_members')
    .delete()
    .eq('id', memberId);

  if (error) {
    throw new Error('Unable to remove this household member.');
  }
}

export async function leaveHousehold(memberId: string) {
  await removeHouseholdMember(memberId);
}

export async function createCareHandoff(input: {
  authorUserId: string;
  dogId: string;
  householdId: string;
  note: string;
}) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('care_handoffs')
    .insert({
      author_user_id: input.authorUserId,
      dog_id: input.dogId,
      household_id: input.householdId,
      note: input.note.trim(),
      starts_at: new Date().toISOString(),
      status: 'open',
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error('Unable to save this care handoff.');
  }

  return data;
}

export async function createSitterInvite(
  input: Omit<CreateHouseholdInviteInput, 'role'>,
) {
  return createHouseholdInvite({
    ...input,
    role: 'sitter',
  });
}

export function getSitterInviteExpiresAt() {
  return getSitterExpiryDate(2);
}
