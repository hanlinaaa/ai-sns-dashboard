create table if not exists public.history_records (
  id text primary key,
  data jsonb not null,
  data_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.calendar_events (
  id text primary key,
  data jsonb not null,
  data_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.brand_settings (
  id text primary key,
  data jsonb not null,
  data_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.system_settings (
  id text primary key,
  data jsonb not null,
  data_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.generated_contents (
  id text primary key,
  data jsonb not null,
  data_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.publish_jobs (
  id text primary key,
  data jsonb not null,
  data_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.platform_accounts (
  id text primary key,
  data jsonb not null,
  data_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.analytics_metrics (
  id text primary key,
  data jsonb not null,
  data_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_history_records_updated_at on public.history_records;
create trigger set_history_records_updated_at
before update on public.history_records
for each row execute function public.set_updated_at();

drop trigger if exists set_calendar_events_updated_at on public.calendar_events;
create trigger set_calendar_events_updated_at
before update on public.calendar_events
for each row execute function public.set_updated_at();

drop trigger if exists set_brand_settings_updated_at on public.brand_settings;
create trigger set_brand_settings_updated_at
before update on public.brand_settings
for each row execute function public.set_updated_at();

drop trigger if exists set_system_settings_updated_at on public.system_settings;
create trigger set_system_settings_updated_at
before update on public.system_settings
for each row execute function public.set_updated_at();

drop trigger if exists set_generated_contents_updated_at on public.generated_contents;
create trigger set_generated_contents_updated_at
before update on public.generated_contents
for each row execute function public.set_updated_at();

drop trigger if exists set_publish_jobs_updated_at on public.publish_jobs;
create trigger set_publish_jobs_updated_at
before update on public.publish_jobs
for each row execute function public.set_updated_at();

drop trigger if exists set_platform_accounts_updated_at on public.platform_accounts;
create trigger set_platform_accounts_updated_at
before update on public.platform_accounts
for each row execute function public.set_updated_at();

drop trigger if exists set_analytics_metrics_updated_at on public.analytics_metrics;
create trigger set_analytics_metrics_updated_at
before update on public.analytics_metrics
for each row execute function public.set_updated_at();

alter table public.history_records enable row level security;
alter table public.calendar_events enable row level security;
alter table public.brand_settings enable row level security;
alter table public.system_settings enable row level security;
alter table public.generated_contents enable row level security;
alter table public.publish_jobs enable row level security;
alter table public.platform_accounts enable row level security;
alter table public.analytics_metrics enable row level security;

drop policy if exists "Allow dashboard read access" on public.history_records;
drop policy if exists "Allow dashboard write access" on public.history_records;
create policy "Allow dashboard read access" on public.history_records for select to anon using (true);
create policy "Allow dashboard write access" on public.history_records for all to anon using (true) with check (true);

drop policy if exists "Allow dashboard read access" on public.calendar_events;
drop policy if exists "Allow dashboard write access" on public.calendar_events;
create policy "Allow dashboard read access" on public.calendar_events for select to anon using (true);
create policy "Allow dashboard write access" on public.calendar_events for all to anon using (true) with check (true);

drop policy if exists "Allow dashboard read access" on public.brand_settings;
drop policy if exists "Allow dashboard write access" on public.brand_settings;
create policy "Allow dashboard read access" on public.brand_settings for select to anon using (true);
create policy "Allow dashboard write access" on public.brand_settings for all to anon using (true) with check (true);

drop policy if exists "Allow dashboard read access" on public.system_settings;
drop policy if exists "Allow dashboard write access" on public.system_settings;
create policy "Allow dashboard read access" on public.system_settings for select to anon using (true);
create policy "Allow dashboard write access" on public.system_settings for all to anon using (true) with check (true);

drop policy if exists "Allow dashboard read access" on public.generated_contents;
drop policy if exists "Allow dashboard write access" on public.generated_contents;
create policy "Allow dashboard read access" on public.generated_contents for select to anon using (true);
create policy "Allow dashboard write access" on public.generated_contents for all to anon using (true) with check (true);

drop policy if exists "Allow dashboard read access" on public.publish_jobs;
drop policy if exists "Allow dashboard write access" on public.publish_jobs;
create policy "Allow dashboard read access" on public.publish_jobs for select to anon using (true);
create policy "Allow dashboard write access" on public.publish_jobs for all to anon using (true) with check (true);

drop policy if exists "Allow dashboard read access" on public.platform_accounts;
drop policy if exists "Allow dashboard write access" on public.platform_accounts;
create policy "Allow dashboard read access" on public.platform_accounts for select to anon using (true);
create policy "Allow dashboard write access" on public.platform_accounts for all to anon using (true) with check (true);

drop policy if exists "Allow dashboard read access" on public.analytics_metrics;
drop policy if exists "Allow dashboard write access" on public.analytics_metrics;
create policy "Allow dashboard read access" on public.analytics_metrics for select to anon using (true);
create policy "Allow dashboard write access" on public.analytics_metrics for all to anon using (true) with check (true);
