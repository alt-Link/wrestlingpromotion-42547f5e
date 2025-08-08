-- Add timeline jsonb and end_date to rivalries for syncing detailed data
alter table public.rivalries
  add column if not exists timeline jsonb default '[]'::jsonb,
  add column if not exists end_date date;

-- No change to RLS needed; existing policies apply to the new columns