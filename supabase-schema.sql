-- Supabase Schema for Ohod Perfumes Store
-- انسخ هذا الكود بالكامل وضعه في SQL Editor في Supabase ثم اضغط Run

create table if not exists store_data (
  key text primary key,
  value jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- إعطاء صلاحية القراءة والتعديل
alter table store_data enable row level security;

create policy "Allow public read" on store_data
  for select using (true);

create policy "Allow all updates" on store_data
  for all using (true);
