alter table public.users
  add column if not exists updated_at timestamptz not null default now();

alter table public.dogs
  add column if not exists updated_at timestamptz not null default now();

alter table public.events
  add column if not exists updated_at timestamptz not null default now();

alter table public.medications
  add column if not exists updated_at timestamptz not null default now();

alter table public.insights
  add column if not exists updated_at timestamptz not null default now();

alter table public.vaccinations
  add column if not exists updated_at timestamptz not null default now();

alter table public.expenses
  add column if not exists updated_at timestamptz not null default now();

create or replace function public.set_barklog_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
before update on public.users
for each row execute function public.set_barklog_updated_at();

drop trigger if exists set_dogs_updated_at on public.dogs;
create trigger set_dogs_updated_at
before update on public.dogs
for each row execute function public.set_barklog_updated_at();

drop trigger if exists set_events_updated_at on public.events;
create trigger set_events_updated_at
before update on public.events
for each row execute function public.set_barklog_updated_at();

drop trigger if exists set_medications_updated_at on public.medications;
create trigger set_medications_updated_at
before update on public.medications
for each row execute function public.set_barklog_updated_at();

drop trigger if exists set_insights_updated_at on public.insights;
create trigger set_insights_updated_at
before update on public.insights
for each row execute function public.set_barklog_updated_at();

drop trigger if exists set_vaccinations_updated_at on public.vaccinations;
create trigger set_vaccinations_updated_at
before update on public.vaccinations
for each row execute function public.set_barklog_updated_at();

drop trigger if exists set_expenses_updated_at on public.expenses;
create trigger set_expenses_updated_at
before update on public.expenses
for each row execute function public.set_barklog_updated_at();

create table if not exists public.sync_deleted_records (
  id uuid primary key default gen_random_uuid(),
  table_name text not null check (
    table_name in (
      'users',
      'dogs',
      'events',
      'medications',
      'insights',
      'vaccinations',
      'expenses'
    )
  ),
  record_id uuid not null,
  user_id uuid not null references public.users (id) on delete cascade,
  deleted_at timestamptz not null default now()
);

create index if not exists idx_sync_deleted_records_user_deleted_at
  on public.sync_deleted_records (user_id, deleted_at desc);

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

  return old;
end;
$$;

drop trigger if exists record_users_sync_delete on public.users;
create trigger record_users_sync_delete
before delete on public.users
for each row execute function public.record_barklog_sync_delete();

drop trigger if exists record_dogs_sync_delete on public.dogs;
create trigger record_dogs_sync_delete
before delete on public.dogs
for each row execute function public.record_barklog_sync_delete();

drop trigger if exists record_events_sync_delete on public.events;
create trigger record_events_sync_delete
before delete on public.events
for each row execute function public.record_barklog_sync_delete();

drop trigger if exists record_medications_sync_delete on public.medications;
create trigger record_medications_sync_delete
before delete on public.medications
for each row execute function public.record_barklog_sync_delete();

drop trigger if exists record_insights_sync_delete on public.insights;
create trigger record_insights_sync_delete
before delete on public.insights
for each row execute function public.record_barklog_sync_delete();

drop trigger if exists record_vaccinations_sync_delete on public.vaccinations;
create trigger record_vaccinations_sync_delete
before delete on public.vaccinations
for each row execute function public.record_barklog_sync_delete();

drop trigger if exists record_expenses_sync_delete on public.expenses;
create trigger record_expenses_sync_delete
before delete on public.expenses
for each row execute function public.record_barklog_sync_delete();
