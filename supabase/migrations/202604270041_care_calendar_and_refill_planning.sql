create table if not exists public.care_tasks (
  id uuid primary key default gen_random_uuid(),
  dog_id uuid references public.dogs (id) on delete cascade not null,
  user_id uuid references public.users (id) on delete cascade not null,
  type text not null check (
    type in (
      'medication_refill',
      'parasite_prevention',
      'grooming',
      'vaccination',
      'vet_follow_up',
      'training_practice',
      'custom'
    )
  ),
  title text not null,
  due_at timestamptz not null,
  recurrence text not null default 'none' check (
    recurrence in ('none', 'daily', 'weekly', 'monthly', 'custom')
  ),
  reminder_enabled boolean not null default false,
  completed_at timestamptz,
  notes text,
  related_medication_id uuid references public.medications (id) on delete set null,
  remaining_count integer check (remaining_count is null or remaining_count >= 0),
  created_at timestamptz default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_care_tasks_dog_due
  on public.care_tasks (dog_id, due_at asc);

create index if not exists idx_care_tasks_user_due
  on public.care_tasks (user_id, due_at asc);

create index if not exists idx_care_tasks_type
  on public.care_tasks (type);

drop trigger if exists set_care_tasks_updated_at on public.care_tasks;
create trigger set_care_tasks_updated_at
before update on public.care_tasks
for each row execute function public.set_barklog_updated_at();

alter table public.care_tasks enable row level security;

drop policy if exists "Users read own and shared care tasks" on public.care_tasks;
drop policy if exists "Users create own or shared care tasks" on public.care_tasks;
drop policy if exists "Users update own care tasks" on public.care_tasks;
drop policy if exists "Users delete own care tasks" on public.care_tasks;

create policy "Users read own and shared care tasks" on public.care_tasks
for select
using (
  auth.uid() = user_id
  or public.current_user_can_view_shared_dog(dog_id)
);

create policy "Users create own or shared care tasks" on public.care_tasks
for insert
with check (
  auth.uid() = user_id
  and (
    public.current_user_owns_dog(dog_id)
    or public.current_user_can_create_shared_dog_log(dog_id)
  )
);

create policy "Users update own care tasks" on public.care_tasks
for update
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and (
    public.current_user_owns_dog(dog_id)
    or public.current_user_can_create_shared_dog_log(dog_id)
  )
);

create policy "Users delete own care tasks" on public.care_tasks
for delete
using (auth.uid() = user_id);

alter table public.sync_deleted_records
  drop constraint if exists sync_deleted_records_table_name_check;

alter table public.sync_deleted_records
  add constraint sync_deleted_records_table_name_check
  check (
    table_name in (
      'users',
      'dogs',
      'events',
      'medications',
      'insights',
      'vaccinations',
      'expenses',
      'dog_training_enrollments',
      'training_sessions',
      'care_tasks'
    )
  );

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
  elsif tg_table_name in ('events', 'expenses', 'care_tasks') then
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

  if tg_table_name in (
    'events',
    'expenses',
    'medications',
    'insights',
    'vaccinations',
    'care_tasks'
  ) then
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

drop trigger if exists record_care_tasks_sync_delete on public.care_tasks;
create trigger record_care_tasks_sync_delete
before delete on public.care_tasks
for each row execute function public.record_barklog_sync_delete();
