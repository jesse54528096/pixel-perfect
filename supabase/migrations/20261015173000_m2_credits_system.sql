-- M2: credits system (profiles.credits_balance, ledger, products, signup bonus)

-- 0. profiles (M1 did not create it)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user',
  email text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

do $$ begin
  create policy "Users can view own profile" on public.profiles
    for select using (id = auth.uid());
exception when duplicate_object then null; end $$;

-- 1. credits_balance on profiles
alter table public.profiles
  add column if not exists credits_balance numeric not null default 30;

-- Backfill: every existing user gets a profile with the 30-credit signup bonus
insert into public.profiles (id, email, credits_balance)
select u.id, u.email, 30 from auth.users u
on conflict (id) do nothing;

-- 2. Ledger
create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null,
  type text not null check (type in ('purchase', 'deduction', 'signup_bonus', 'admin_grant')),
  description text,
  job_id uuid references public.jobs(id),
  stripe_payment_intent_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_credit_transactions_user_id
  on public.credit_transactions(user_id, created_at desc);

-- Idempotency: at most one purchase row per payment_intent
create unique index if not exists uniq_credit_tx_payment_intent
  on public.credit_transactions(stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

alter table public.credit_transactions enable row level security;

do $$ begin
  create policy "Users can view own transactions" on public.credit_transactions
    for select using (user_id = auth.uid());
exception when duplicate_object then null; end $$;

-- 3. Products catalog (Stripe sandbox prices)
create table if not exists public.credit_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  credits numeric not null,
  price_usd numeric not null,
  stripe_price_id text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.credit_products enable row level security;

do $$ begin
  create policy "Authenticated users can view active products" on public.credit_products
    for select to authenticated using (active = true);
exception when duplicate_object then null; end $$;

insert into public.credit_products (name, credits, price_usd, stripe_price_id)
select * from (values
  ('10 Credits', 10, 10.00, 'price_1UQsSgCh7GfJFokpi1KTGoAV'),
  ('45 Credits', 45, 30.00, 'price_1UQsSjCh7GfJFokpXOOH50dQ'),
  ('90 Credits', 90, 60.00, 'price_1UQsSlCh7GfJFokpxfkVT0vI')
) as v(name, credits, price_usd, stripe_price_id)
where not exists (select 1 from public.credit_products);

-- 4. Signup trigger: 30-credit welcome bonus
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, credits_balance)
    values (new.id, new.email, 'user', 30)
    on conflict (id) do nothing;
  insert into public.credit_transactions (user_id, amount, type, description)
    values (new.id, 30, 'signup_bonus', 'Welcome bonus — 30 free credits');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. New job status: insufficient_credits (keeps M1's four statuses)
alter table public.jobs drop constraint if exists jobs_status_check;
alter table public.jobs add constraint jobs_status_check
  check (status in ('pending', 'downloading', 'transcribe', 'done', 'insufficient_credits'));

-- 6. Backfill signup_bonus ledger rows for users created before this migration
insert into public.credit_transactions (user_id, amount, type, description)
select u.id, 30, 'signup_bonus', 'Welcome bonus — 30 free credits (backfilled)'
from auth.users u
left join public.credit_transactions ct
  on ct.user_id = u.id and ct.type = 'signup_bonus'
where ct.id is null;
