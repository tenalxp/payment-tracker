-- coffee_entries table (skip if already exists)
create table if not exists coffee_entries (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  name text not null,
  menu text,
  price numeric(10,2) not null,
  currency text default '฿',
  description text,
  status text not null default 'pending' check (status in ('pending','paid_qr','paid_cash')),
  created_at timestamptz default now()
);
-- add new columns if table already existed
alter table coffee_entries add column if not exists currency text default '฿';
alter table coffee_entries add column if not exists description text;

create index if not exists idx_coffee_entries_date on coffee_entries(date);
alter table coffee_entries enable row level security;
drop policy if exists "allow all" on coffee_entries;
create policy "allow all" on coffee_entries for all using (true);

-- people table
create table if not exists people (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz default now()
);
alter table people enable row level security;
drop policy if exists "allow all" on people;
create policy "allow all" on people for all using (true);

-- items table
create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz default now()
);
insert into items (name) values ('ค่ากาแฟ'), ('ยืมเงิน')
  on conflict (name) do nothing;
alter table items enable row level security;
drop policy if exists "allow all" on items;
create policy "allow all" on items for all using (true);
