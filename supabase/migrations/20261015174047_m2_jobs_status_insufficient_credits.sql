-- 5. New job status: insufficient_credits (keeps M1's four statuses)
alter table public.jobs drop constraint if exists jobs_status_check;
alter table public.jobs add constraint jobs_status_check
  check (status in ('pending', 'downloading', 'transcribe', 'done', 'insufficient_credits'));
