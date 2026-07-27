create table public.training_programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  category text not null check (
    category in (
      'obedience',
      'behavior_modification',
      'socialization',
      'tricks',
      'puppy_basics',
      'leash_skills'
    )
  ),
  difficulty text not null check (
    difficulty in ('beginner', 'intermediate', 'advanced')
  ),
  estimated_days integer not null check (estimated_days > 0),
  icon text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table public.training_steps (
  id uuid primary key default gen_random_uuid(),
  program_id uuid references public.training_programs (id) on delete cascade not null,
  step_number integer not null check (step_number > 0),
  title text not null,
  instruction text not null,
  tip text,
  estimated_duration_min integer default 10 check (estimated_duration_min > 0),
  created_at timestamptz default now(),
  unique (program_id, step_number)
);

create table public.dog_training_enrollments (
  id uuid primary key default gen_random_uuid(),
  dog_id uuid references public.dogs (id) on delete cascade not null,
  user_id uuid references public.users (id) on delete cascade not null,
  program_id uuid references public.training_programs (id) on delete cascade not null,
  current_step integer default 1 check (current_step > 0),
  started_at timestamptz default now(),
  completed_at timestamptz,
  status text default 'active' check (
    status in ('active', 'paused', 'completed', 'abandoned')
  ),
  created_at timestamptz default now(),
  updated_at timestamptz not null default now(),
  unique (dog_id, program_id)
);

create table public.training_sessions (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid references public.dog_training_enrollments (id) on delete cascade not null,
  dog_id uuid references public.dogs (id) on delete cascade not null,
  user_id uuid references public.users (id) on delete cascade not null,
  step_id uuid references public.training_steps (id) not null,
  duration_min integer check (duration_min is null or duration_min >= 0),
  success_rating integer check (success_rating between 1 and 5),
  dog_mood text check (
    dog_mood in (
      'happy',
      'calm',
      'anxious',
      'lethargic',
      'hyper',
      'clingy',
      'off'
    )
  ),
  notes text,
  completed_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz not null default now()
);

create index idx_training_programs_category_sort
  on public.training_programs (category, sort_order, name);

create index idx_training_steps_program_step
  on public.training_steps (program_id, step_number);

create index idx_training_enrollments_user_status
  on public.dog_training_enrollments (user_id, status, started_at desc);

create index idx_training_enrollments_dog_status
  on public.dog_training_enrollments (dog_id, status, started_at desc);

create index idx_training_sessions_enrollment_completed
  on public.training_sessions (enrollment_id, completed_at desc);

create index idx_training_sessions_dog_completed
  on public.training_sessions (dog_id, completed_at desc);

drop trigger if exists set_dog_training_enrollments_updated_at
  on public.dog_training_enrollments;
create trigger set_dog_training_enrollments_updated_at
before update on public.dog_training_enrollments
for each row execute function public.set_barklog_updated_at();

drop trigger if exists set_training_sessions_updated_at
  on public.training_sessions;
create trigger set_training_sessions_updated_at
before update on public.training_sessions
for each row execute function public.set_barklog_updated_at();

alter table public.training_programs enable row level security;
alter table public.training_steps enable row level security;
alter table public.dog_training_enrollments enable row level security;
alter table public.training_sessions enable row level security;

create policy "Authenticated users read training programs"
on public.training_programs
for select
to authenticated
using (true);

create policy "Authenticated users read training steps"
on public.training_steps
for select
to authenticated
using (true);

create policy "Users see own enrollments"
on public.dog_training_enrollments
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users see own training sessions"
on public.training_sessions
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

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
      'training_sessions'
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
  elsif tg_table_name in (
    'events',
    'expenses',
    'dog_training_enrollments',
    'training_sessions'
  ) then
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

drop trigger if exists record_dog_training_enrollments_sync_delete
  on public.dog_training_enrollments;
create trigger record_dog_training_enrollments_sync_delete
before delete on public.dog_training_enrollments
for each row execute function public.record_barklog_sync_delete();

drop trigger if exists record_training_sessions_sync_delete
  on public.training_sessions;
create trigger record_training_sessions_sync_delete
before delete on public.training_sessions
for each row execute function public.record_barklog_sync_delete();
