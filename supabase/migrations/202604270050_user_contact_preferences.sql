create table if not exists public.user_contact_preferences (
  user_id uuid primary key references public.users (id) on delete cascade,
  preferred_name text,
  primary_goal text check (
    primary_goal in (
      'health_patterns',
      'training',
      'medications',
      'vet_prep',
      'multi_caregiver',
      'other'
    )
  ),
  preferred_contact_channel text check (
    preferred_contact_channel in (
      'email',
      'whatsapp',
      'sms',
      'telegram',
      'signal',
      'other'
    )
  ),
  contact_value text,
  support_contact_consent boolean not null default false,
  marketing_contact_consent boolean not null default false,
  consent_source text not null default 'signup_contact_preferences',
  support_consented_at timestamptz,
  marketing_consented_at timestamptz,
  skipped_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_user_contact_preferences_updated_at on public.user_contact_preferences;
create trigger set_user_contact_preferences_updated_at
before update on public.user_contact_preferences
for each row execute function public.set_barklog_updated_at();

alter table public.user_contact_preferences enable row level security;

drop policy if exists "Users read own contact preferences" on public.user_contact_preferences;
drop policy if exists "Users create own contact preferences" on public.user_contact_preferences;
drop policy if exists "Users update own contact preferences" on public.user_contact_preferences;

create policy "Users read own contact preferences" on public.user_contact_preferences
for select
using (auth.uid() = user_id);

create policy "Users create own contact preferences" on public.user_contact_preferences
for insert
with check (auth.uid() = user_id);

create policy "Users update own contact preferences" on public.user_contact_preferences
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
