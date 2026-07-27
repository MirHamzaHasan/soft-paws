create table if not exists public.vet_share_links (
  id uuid primary key default gen_random_uuid(),
  dog_id uuid references public.dogs (id) on delete cascade not null,
  user_id uuid references public.users (id) on delete cascade not null,
  range_start timestamptz not null,
  range_end timestamptz not null,
  token_hash text not null unique,
  report_snapshot jsonb not null default '{}'::jsonb,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_vet_share_links_dog_created
  on public.vet_share_links (dog_id, created_at desc);

create index if not exists idx_vet_share_links_user_active
  on public.vet_share_links (user_id, expires_at desc)
  where revoked_at is null;

create index if not exists idx_vet_share_links_token_hash
  on public.vet_share_links (token_hash);

create or replace function public.current_user_has_premium_access()
returns boolean
language sql
stable
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

alter table public.vet_share_links enable row level security;

drop policy if exists "Users see own vet share links" on public.vet_share_links;
drop policy if exists "Users read own vet share links" on public.vet_share_links;
drop policy if exists "Premium users create own vet share links" on public.vet_share_links;
drop policy if exists "Users update own vet share links" on public.vet_share_links;
drop policy if exists "Users delete own vet share links" on public.vet_share_links;

create policy "Users read own vet share links" on public.vet_share_links
for select
using (auth.uid() = user_id);

create policy "Premium users create own vet share links" on public.vet_share_links
for insert
with check (
  auth.uid() = user_id
  and public.current_user_owns_dog(dog_id)
  and public.current_user_has_premium_access()
);

create policy "Users update own vet share links" on public.vet_share_links
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id and public.current_user_owns_dog(dog_id));

create policy "Users delete own vet share links" on public.vet_share_links
for delete
using (auth.uid() = user_id);
