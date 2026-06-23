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

-- Enforce 6-hour cooldown on task completions
create or replace function prevent_early_task_completion()
returns trigger as $$
begin
  if NEW.status = 'completed' and OLD.status = 'pending' then
    if now() < OLD.created_at + interval '6 hours' then
      raise exception 'Task cannot be completed before 6 hours from creation';
    end if;
  end if;
  return NEW;
end;
$$ language plpgsql;

create trigger enforce_task_cooldown
before update on tasks
for each row
execute function prevent_early_task_completion();

-- Calculate true user balance securely
create or replace function get_user_balance(uid uuid)
returns integer as $$
declare
  tx_balance integer;
  tasks_balance integer;
begin
  select coalesce(sum(case when type = 'earn' then pts else -pts end), 0)
  into tx_balance
  from transactions
  where user_id = uid;

  select coalesce(sum(pts), 0)
  into tasks_balance
  from tasks
  where user_id = uid 
    and status = 'completed' 
    and completed_at is not null
    and now() >= created_at + interval '6 hours';

  return tx_balance + tasks_balance;
end;
$$ language plpgsql security definer;

-- Securely claim a reward
create or replace function claim_reward(r_id uuid, tx_id uuid)
returns void as $$
declare
  r_pts integer;
  r_title text;
  r_category text;
  current_balance integer;
begin
  select pts, title, category into r_pts, r_title, r_category
  from rewards
  where id = r_id and user_id = auth.uid();

  if not found then
    raise exception 'Reward not found';
  end if;

  current_balance := get_user_balance(auth.uid());

  if current_balance < r_pts then
    raise exception 'Insufficient balance';
  end if;

  insert into transactions (id, user_id, title, pts, type, category, reward_id)
  values (tx_id, auth.uid(), 'Claimed: ' || r_title, r_pts, 'spend', r_category, r_id);
end;
$$ language plpgsql security invoker;
