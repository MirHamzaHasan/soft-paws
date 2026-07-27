create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references public.users (id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households (id) on delete cascade not null,
  user_id uuid references public.users (id) on delete cascade not null,
  email text,
  display_name text,
  role text not null check (role in ('owner', 'caregiver', 'sitter', 'viewer')),
  permissions jsonb not null default '[]'::jsonb,
  allowed_dog_ids jsonb not null default '[]'::jsonb,
  sitter_expires_at timestamptz,
  invited_by_user_id uuid references public.users (id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz not null default now(),
  unique (household_id, user_id)
);

create table if not exists public.household_dogs (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households (id) on delete cascade not null,
  dog_id uuid references public.dogs (id) on delete cascade not null,
  added_by_user_id uuid references public.users (id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz not null default now(),
  unique (household_id, dog_id)
);

create table if not exists public.household_invites (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households (id) on delete cascade not null,
  inviter_user_id uuid references public.users (id) on delete cascade not null,
  email text not null,
  role text not null check (role in ('caregiver', 'sitter', 'viewer')),
  permissions jsonb not null default '[]'::jsonb,
  dog_ids jsonb not null default '[]'::jsonb,
  token_hash text not null unique,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.care_handoffs (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households (id) on delete cascade not null,
  dog_id uuid references public.dogs (id) on delete cascade not null,
  author_user_id uuid references public.users (id) on delete cascade not null,
  note text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_households_owner_user_id
  on public.households (owner_user_id);

create index if not exists idx_household_members_user_id
  on public.household_members (user_id);

create index if not exists idx_household_members_household_role
  on public.household_members (household_id, role);

create index if not exists idx_household_dogs_dog_id
  on public.household_dogs (dog_id);

create index if not exists idx_household_invites_token_hash
  on public.household_invites (token_hash);

create index if not exists idx_household_invites_household_active
  on public.household_invites (household_id, expires_at desc)
  where accepted_at is null and revoked_at is null;

create index if not exists idx_care_handoffs_household_dog_created
  on public.care_handoffs (household_id, dog_id, created_at desc);

drop trigger if exists set_households_updated_at on public.households;
create trigger set_households_updated_at
before update on public.households
for each row execute function public.set_barklog_updated_at();

drop trigger if exists set_household_members_updated_at on public.household_members;
create trigger set_household_members_updated_at
before update on public.household_members
for each row execute function public.set_barklog_updated_at();

drop trigger if exists set_household_dogs_updated_at on public.household_dogs;
create trigger set_household_dogs_updated_at
before update on public.household_dogs
for each row execute function public.set_barklog_updated_at();

drop trigger if exists set_household_invites_updated_at on public.household_invites;
create trigger set_household_invites_updated_at
before update on public.household_invites
for each row execute function public.set_barklog_updated_at();

drop trigger if exists set_care_handoffs_updated_at on public.care_handoffs;
create trigger set_care_handoffs_updated_at
before update on public.care_handoffs
for each row execute function public.set_barklog_updated_at();

create or replace function public.current_user_has_premium_access()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where users.id = auth.uid()
      and (
        users.subscription_tier in ('active', 'grandfathered')
        or (
          users.subscription_tier = 'trial'
          and users.trial_ends_at is not null
          and users.trial_ends_at > now()
        )
      )
  );
$$;

create or replace function public.current_user_has_household_role(
  target_household_id uuid,
  allowed_roles text[]
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.household_members
    where household_members.household_id = target_household_id
      and household_members.user_id = auth.uid()
      and household_members.role = any(allowed_roles)
      and (
        household_members.role <> 'sitter'
        or household_members.sitter_expires_at is null
        or household_members.sitter_expires_at > now()
      )
  );
$$;

create or replace function public.current_user_has_household_permission(
  target_household_id uuid,
  requested_permission text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.household_members
    where household_members.household_id = target_household_id
      and household_members.user_id = auth.uid()
      and (
        household_members.role = 'owner'
        or household_members.permissions ? requested_permission
      )
      and (
        household_members.role <> 'sitter'
        or household_members.sitter_expires_at is null
        or household_members.sitter_expires_at > now()
      )
  );
$$;

create or replace function public.current_user_can_view_shared_dog(
  target_dog_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.household_dogs
    join public.household_members
      on household_members.household_id = household_dogs.household_id
    where household_dogs.dog_id = target_dog_id
      and household_members.user_id = auth.uid()
      and (
        household_members.role = 'owner'
        or household_members.permissions ? 'view_logs'
      )
      and (
        jsonb_array_length(household_members.allowed_dog_ids) = 0
        or household_members.allowed_dog_ids ? target_dog_id::text
      )
      and (
        household_members.role <> 'sitter'
        or household_members.sitter_expires_at is null
        or household_members.sitter_expires_at > now()
      )
  );
$$;

create or replace function public.current_user_can_create_shared_dog_log(
  target_dog_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.household_dogs
    join public.household_members
      on household_members.household_id = household_dogs.household_id
    where household_dogs.dog_id = target_dog_id
      and household_members.user_id = auth.uid()
      and (
        household_members.role = 'owner'
        or household_members.permissions ? 'create_logs'
      )
      and (
        jsonb_array_length(household_members.allowed_dog_ids) = 0
        or household_members.allowed_dog_ids ? target_dog_id::text
      )
      and (
        household_members.role <> 'sitter'
        or household_members.sitter_expires_at is null
        or household_members.sitter_expires_at > now()
      )
  );
$$;

create or replace function public.current_user_can_manage_shared_dog_records(
  target_dog_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.household_dogs
    join public.household_members
      on household_members.household_id = household_dogs.household_id
    where household_dogs.dog_id = target_dog_id
      and household_members.user_id = auth.uid()
      and (
        household_members.role = 'owner'
        or household_members.permissions ? 'manage_medications'
      )
      and (
        jsonb_array_length(household_members.allowed_dog_ids) = 0
        or household_members.allowed_dog_ids ? target_dog_id::text
      )
      and (
        household_members.role <> 'sitter'
        or household_members.sitter_expires_at is null
        or household_members.sitter_expires_at > now()
      )
  );
$$;

alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.household_dogs enable row level security;
alter table public.household_invites enable row level security;
alter table public.care_handoffs enable row level security;

drop policy if exists "Members read households" on public.households;
drop policy if exists "Premium users create households" on public.households;
drop policy if exists "Household owners update households" on public.households;
drop policy if exists "Household owners delete households" on public.households;

create policy "Members read households" on public.households
for select
using (
  owner_user_id = auth.uid()
  or public.current_user_has_household_permission(id, 'view_logs')
);

create policy "Premium users create households" on public.households
for insert
with check (
  owner_user_id = auth.uid()
  and public.current_user_has_premium_access()
);

create policy "Household owners update households" on public.households
for update
using (
  owner_user_id = auth.uid()
  or public.current_user_has_household_permission(id, 'manage_members')
)
with check (
  owner_user_id = auth.uid()
  or public.current_user_has_household_permission(id, 'manage_members')
);

create policy "Household owners delete households" on public.households
for delete
using (owner_user_id = auth.uid());

drop policy if exists "Members read household members" on public.household_members;
drop policy if exists "Household managers add members" on public.household_members;
drop policy if exists "Household managers update members" on public.household_members;
drop policy if exists "Household managers remove members" on public.household_members;

create policy "Members read household members" on public.household_members
for select
using (public.current_user_has_household_permission(household_id, 'view_logs'));

create policy "Household managers add members" on public.household_members
for insert
with check (
  public.current_user_has_premium_access()
  and (
    public.current_user_has_household_permission(household_id, 'manage_members')
    or (
      user_id = auth.uid()
      and role = 'owner'
      and permissions ? 'manage_members'
      and exists (
        select 1
        from public.households
        where households.id = household_id
          and households.owner_user_id = auth.uid()
      )
    )
  )
);

create policy "Household managers update members" on public.household_members
for update
using (public.current_user_has_household_permission(household_id, 'manage_members'))
with check (public.current_user_has_household_permission(household_id, 'manage_members'));

create policy "Household managers remove members" on public.household_members
for delete
using (
  user_id = auth.uid()
  or public.current_user_has_household_permission(household_id, 'manage_members')
);

drop policy if exists "Members read household dogs" on public.household_dogs;
drop policy if exists "Household managers add dogs" on public.household_dogs;
drop policy if exists "Household managers remove dogs" on public.household_dogs;

create policy "Members read household dogs" on public.household_dogs
for select
using (public.current_user_has_household_permission(household_id, 'view_logs'));

create policy "Household managers add dogs" on public.household_dogs
for insert
with check (
  public.current_user_has_household_permission(household_id, 'manage_members')
  and public.current_user_owns_dog(dog_id)
);

create policy "Household managers remove dogs" on public.household_dogs
for delete
using (public.current_user_has_household_permission(household_id, 'manage_members'));

drop policy if exists "Household managers read invites" on public.household_invites;
drop policy if exists "Household managers create invites" on public.household_invites;
drop policy if exists "Household managers update invites" on public.household_invites;
drop policy if exists "Household managers delete invites" on public.household_invites;

create policy "Household managers read invites" on public.household_invites
for select
using (public.current_user_has_household_permission(household_id, 'manage_members'));

create policy "Household managers create invites" on public.household_invites
for insert
with check (
  inviter_user_id = auth.uid()
  and public.current_user_has_premium_access()
  and public.current_user_has_household_permission(household_id, 'manage_members')
);

create policy "Household managers update invites" on public.household_invites
for update
using (public.current_user_has_household_permission(household_id, 'manage_members'))
with check (public.current_user_has_household_permission(household_id, 'manage_members'));

create policy "Household managers delete invites" on public.household_invites
for delete
using (public.current_user_has_household_permission(household_id, 'manage_members'));

drop policy if exists "Members read care handoffs" on public.care_handoffs;
drop policy if exists "Members create care handoffs" on public.care_handoffs;
drop policy if exists "Members update care handoffs" on public.care_handoffs;
drop policy if exists "Members delete own care handoffs" on public.care_handoffs;

create policy "Members read care handoffs" on public.care_handoffs
for select
using (
  public.current_user_has_household_permission(household_id, 'view_logs')
  and public.current_user_can_view_shared_dog(dog_id)
);

create policy "Members create care handoffs" on public.care_handoffs
for insert
with check (
  author_user_id = auth.uid()
  and public.current_user_has_household_permission(household_id, 'create_logs')
  and public.current_user_can_view_shared_dog(dog_id)
);

create policy "Members update care handoffs" on public.care_handoffs
for update
using (
  author_user_id = auth.uid()
  or public.current_user_has_household_permission(household_id, 'manage_members')
)
with check (
  author_user_id = auth.uid()
  or public.current_user_has_household_permission(household_id, 'manage_members')
);

create policy "Members delete own care handoffs" on public.care_handoffs
for delete
using (
  author_user_id = auth.uid()
  or public.current_user_has_household_permission(household_id, 'manage_members')
);

drop policy if exists "Users see own dogs" on public.dogs;
drop policy if exists "Users read own and shared dogs" on public.dogs;
drop policy if exists "Users create own dogs" on public.dogs;
drop policy if exists "Users update own dogs" on public.dogs;
drop policy if exists "Users delete own dogs" on public.dogs;

create policy "Users read own and shared dogs" on public.dogs
for select
using (
  auth.uid() = user_id
  or public.current_user_can_view_shared_dog(id)
);

create policy "Users create own dogs" on public.dogs
for insert
with check (auth.uid() = user_id);

create policy "Users update own dogs" on public.dogs
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users delete own dogs" on public.dogs
for delete
using (auth.uid() = user_id);

drop policy if exists "Users see own events" on public.events;
drop policy if exists "Users read own and shared events" on public.events;
drop policy if exists "Users create own or shared events" on public.events;
drop policy if exists "Users update own events" on public.events;
drop policy if exists "Users delete own events" on public.events;

create policy "Users read own and shared events" on public.events
for select
using (
  auth.uid() = user_id
  or public.current_user_can_view_shared_dog(dog_id)
);

create policy "Users create own or shared events" on public.events
for insert
with check (
  auth.uid() = user_id
  and (
    public.current_user_owns_dog(dog_id)
    or public.current_user_can_create_shared_dog_log(dog_id)
  )
);

create policy "Users update own events" on public.events
for update
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and (
    public.current_user_owns_dog(dog_id)
    or public.current_user_can_create_shared_dog_log(dog_id)
  )
);

create policy "Users delete own events" on public.events
for delete
using (auth.uid() = user_id);

drop policy if exists "Users see own meds" on public.medications;
drop policy if exists "Users read own and shared meds" on public.medications;
drop policy if exists "Users manage own and permitted shared meds" on public.medications;

create policy "Users read own and shared meds" on public.medications
for select
using (
  public.current_user_owns_dog(dog_id)
  or public.current_user_can_manage_shared_dog_records(dog_id)
);

create policy "Users manage own and permitted shared meds" on public.medications
for all
using (
  public.current_user_owns_dog(dog_id)
  or public.current_user_can_manage_shared_dog_records(dog_id)
)
with check (
  public.current_user_owns_dog(dog_id)
  or public.current_user_can_manage_shared_dog_records(dog_id)
);

drop policy if exists "Users see own vaccinations" on public.vaccinations;
drop policy if exists "Users read own and shared vaccinations" on public.vaccinations;
drop policy if exists "Users manage own and permitted shared vaccinations" on public.vaccinations;

create policy "Users read own and shared vaccinations" on public.vaccinations
for select
using (
  public.current_user_owns_dog(dog_id)
  or public.current_user_can_manage_shared_dog_records(dog_id)
);

create policy "Users manage own and permitted shared vaccinations" on public.vaccinations
for all
using (
  public.current_user_owns_dog(dog_id)
  or public.current_user_can_manage_shared_dog_records(dog_id)
)
with check (
  public.current_user_owns_dog(dog_id)
  or public.current_user_can_manage_shared_dog_records(dog_id)
);

drop policy if exists "Users see own expenses" on public.expenses;
drop policy if exists "Users read own and shared expenses" on public.expenses;
drop policy if exists "Users create own or shared expenses" on public.expenses;
drop policy if exists "Users update own expenses" on public.expenses;
drop policy if exists "Users delete own expenses" on public.expenses;

create policy "Users read own and shared expenses" on public.expenses
for select
using (
  auth.uid() = user_id
  or public.current_user_can_view_shared_dog(dog_id)
);

create policy "Users create own or shared expenses" on public.expenses
for insert
with check (
  auth.uid() = user_id
  and (
    public.current_user_owns_dog(dog_id)
    or public.current_user_can_create_shared_dog_log(dog_id)
  )
);

create policy "Users update own expenses" on public.expenses
for update
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and (
    public.current_user_owns_dog(dog_id)
    or public.current_user_can_create_shared_dog_log(dog_id)
  )
);

create policy "Users delete own expenses" on public.expenses
for delete
using (auth.uid() = user_id);

create or replace function public.record_barklog_sync_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_user_id uuid;
begin
  if tg_table_name = 'users' then
    owner_user_id := old.id;
  elsif tg_table_name = 'dogs' then
    owner_user_id := old.user_id;
  elsif tg_table_name in ('events', 'expenses') then
    owner_user_id := old.user_id;
  elsif tg_table_name in ('medications', 'insights', 'vaccinations') then
    select dogs.user_id
      into owner_user_id
      from public.dogs
      where dogs.id = old.dog_id;
  end if;

  if owner_user_id is not null then
    insert into public.sync_deleted_records (table_name, record_id, user_id)
    values (tg_table_name, old.id, owner_user_id);
  end if;

  if tg_table_name in ('events', 'expenses', 'medications', 'insights', 'vaccinations') then
    insert into public.sync_deleted_records (table_name, record_id, user_id)
    select distinct tg_table_name, old.id, household_members.user_id
    from public.household_dogs
    join public.household_members
      on household_members.household_id = household_dogs.household_id
    where household_dogs.dog_id = old.dog_id
      and household_members.user_id <> owner_user_id
      and (
        household_members.role <> 'sitter'
        or household_members.sitter_expires_at is null
        or household_members.sitter_expires_at > now()
      );
  end if;

  return old;
end;
$$;
