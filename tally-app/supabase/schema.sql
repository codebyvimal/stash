-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Tasks (planned work items)
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  pts integer not null check (pts > 0),
  category text,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- Rewards catalog (must be created before transactions due to FK)
create table rewards (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text,
  pts integer not null check (pts > 0),
  category text not null default 'Other',
  image_url text,
  created_at timestamptz default now()
);

-- Transactions (earn and spend events — manual or reward claims)
create table transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  pts integer not null check (pts > 0),
  type text not null check (type in ('earn', 'spend')),
  category text,
  reward_id uuid references rewards(id),
  task_id uuid references tasks(id),
  created_at timestamptz default now()
);

-- Row Level Security
alter table tasks enable row level security;
alter table transactions enable row level security;
alter table rewards enable row level security;

create policy "Users manage own tasks" on tasks
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own transactions" on transactions
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own rewards" on rewards
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
