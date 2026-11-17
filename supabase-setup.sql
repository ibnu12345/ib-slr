-- =========================================================================
-- IB-SLR (From Literature to Evidence) - Supabase Cloud Database Setup
-- Jalankan perintah SQL ini di Supabase Dashboard -> SQL Editor -> Run
-- =========================================================================

-- 1. Buat tabel penyimpanan status permanen cloud
create table if not exists app_state (
  key text primary key,
  payload jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Aktifkan Row-Level Security (RLS)
alter table app_state enable row level security;

-- 3. Izinkan akses sinkronisasi API dari Vercel
drop policy if exists "Allow public read-write for app_state" on app_state;
create policy "Allow public read-write for app_state" on app_state
  for all
  using (true)
  with check (true);

-- Selesai! Tabel siap digunakan oleh IB-SLR di Vercel secara otomatis.
