create extension if not exists pgcrypto;

create table public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz default now(),
  subscription_tier text default 'trial' check (
    subscription_tier in ('trial', 'active', 'expired', 'grandfathered')
  ),
  trial_ends_at timestamptz,
  revenuecat_user_id text
);

alter table public.users
  add constraint users_auth_users_fkey
  foreign key (id) references auth.users (id) on delete cascade;

create table public.dogs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade not null,
  name text not null,
  breed text,
  birthdate date,
  weight_lbs numeric,
  sex text check (
    sex in ('male', 'female', 'neutered_male', 'spayed_female')
  ),
  photo_url text,
  is_primary boolean default true,
  created_at timestamptz default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  dog_id uuid references public.dogs (id) on delete cascade not null,
  user_id uuid references public.users (id) on delete cascade not null,
  type text not null check (
    type in (
      'poop',
      'pee',
      'meal',
      'walk',
      'medication',
      'symptom',
      'grooming',
      'weight',
      'note'
    )
  ),
  occurred_at timestamptz not null,
  logged_at timestamptz default now(),
  details jsonb default '{}'::jsonb,
  photo_url text,
  notes text,
  synced boolean default false,
  created_at timestamptz default now()
);

create table public.medications (
  id uuid primary key default gen_random_uuid(),
  dog_id uuid references public.dogs (id) on delete cascade not null,
  name text not null,
  dose_mg numeric,
  frequency text check (
    frequency in (
      'daily',
      'twice_daily',
      'every_other_day',
      'weekly',
      'as_needed'
    )
  ),
  schedule_times jsonb default '[]'::jsonb,
  give_with_food boolean default false,
  active boolean default true,
  start_date date,
  end_date date,
  refill_date date,
  notes text,
  created_at timestamptz default now()
);

create table public.insights (
  id uuid primary key default gen_random_uuid(),
  dog_id uuid references public.dogs (id) on delete cascade not null,
  week_start date not null,
  content text not null,
  generated_at timestamptz default now(),
  prompt_version text default 'v1'
);

create table public.vaccinations (
  id uuid primary key default gen_random_uuid(),
  dog_id uuid references public.dogs (id) on delete cascade not null,
  name text not null,
  date_given date,
  next_due date,
  vet_name text,
  record_photo_url text,
  notes text,
  created_at timestamptz default now()
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  dog_id uuid references public.dogs (id) on delete cascade not null,
  user_id uuid references public.users (id) on delete cascade not null,
  amount numeric not null,
  category text check (
    category in (
      'food',
      'vet',
      'grooming',
      'toys',
      'boarding',
      'insurance',
      'medication',
      'other'
    )
  ),
  description text,
  date date not null,
  receipt_photo_url text,
  created_at timestamptz default now()
);

create index idx_dogs_user_id on public.dogs (user_id);
create index idx_events_dog_date on public.events (dog_id, occurred_at desc);
create index idx_events_user_date on public.events (user_id, occurred_at desc);
create index idx_medications_dog_active on public.medications (dog_id, active);
create index idx_insights_dog_week_start on public.insights (dog_id, week_start desc);
create index idx_vaccinations_dog_due_date on public.vaccinations (dog_id, next_due);
create index idx_expenses_dog_date on public.expenses (dog_id, date desc);
create index idx_expenses_user_date on public.expenses (user_id, date desc);

create or replace function public.current_user_owns_dog(target_dog_id uuid)
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.dogs
    where dogs.id = target_dog_id
      and dogs.user_id = auth.uid()
  );
$$;

create or replace function public.is_storage_owner(object_name text)
returns boolean
language sql
stable
as $$
  select auth.uid() is not null
    and split_part(object_name, '/', 1) = auth.uid()::text;
$$;

create or replace function public.handle_auth_user_sync()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do update
    set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_auth_user_sync();

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
after update of email on auth.users
for each row execute function public.handle_auth_user_sync();

alter table public.users enable row level security;
alter table public.dogs enable row level security;
alter table public.events enable row level security;
alter table public.medications enable row level security;
alter table public.insights enable row level security;
alter table public.vaccinations enable row level security;
alter table public.expenses enable row level security;

create policy "Users see own data" on public.users
for all
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users see own dogs" on public.dogs
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users see own events" on public.events
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users see own meds" on public.medications
for all
using (public.current_user_owns_dog(dog_id))
with check (public.current_user_owns_dog(dog_id));

create policy "Users see own insights" on public.insights
for all
using (public.current_user_owns_dog(dog_id))
with check (public.current_user_owns_dog(dog_id));

create policy "Users see own vaccinations" on public.vaccinations
for all
using (public.current_user_owns_dog(dog_id))
with check (public.current_user_owns_dog(dog_id));

create policy "Users see own expenses" on public.expenses
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values
  ('dog-photos', 'dog-photos', false),
  ('event-photos', 'event-photos', false),
  ('expense-receipts', 'expense-receipts', false),
  ('vaccination-records', 'vaccination-records', false)
on conflict (id) do nothing;

create policy "Users read own BarkLog storage objects" on storage.objects
for select
to authenticated
using (
  bucket_id in (
    'dog-photos',
    'event-photos',
    'expense-receipts',
    'vaccination-records'
  )
  and public.is_storage_owner(name)
);

create policy "Users insert own BarkLog storage objects" on storage.objects
for insert
to authenticated
with check (
  bucket_id in (
    'dog-photos',
    'event-photos',
    'expense-receipts',
    'vaccination-records'
  )
  and public.is_storage_owner(name)
);

create policy "Users update own BarkLog storage objects" on storage.objects
for update
to authenticated
using (
  bucket_id in (
    'dog-photos',
    'event-photos',
    'expense-receipts',
    'vaccination-records'
  )
  and public.is_storage_owner(name)
)
with check (
  bucket_id in (
    'dog-photos',
    'event-photos',
    'expense-receipts',
    'vaccination-records'
  )
  and public.is_storage_owner(name)
);

create policy "Users delete own BarkLog storage objects" on storage.objects
for delete
to authenticated
using (
  bucket_id in (
    'dog-photos',
    'event-photos',
    'expense-receipts',
    'vaccination-records'
  )
  and public.is_storage_owner(name)
);
