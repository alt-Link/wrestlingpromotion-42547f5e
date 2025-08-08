-- Create a private storage bucket for application data
insert into storage.buckets (id, name, public)
values ('app-data', 'app-data', false)
on conflict (id) do nothing;

-- RLS policies: users can only access files in their own folder: <user_id>/<...>
create policy "App data - users can view own files"
on storage.objects
for select
using (
  bucket_id = 'app-data' and
  auth.uid()::text = (storage.foldername(name))[1]
);

create policy "App data - users can upload own files"
on storage.objects
for insert
with check (
  bucket_id = 'app-data' and
  auth.uid()::text = (storage.foldername(name))[1]
);

create policy "App data - users can update own files"
on storage.objects
for update
using (
  bucket_id = 'app-data' and
  auth.uid()::text = (storage.foldername(name))[1]
);

create policy "App data - users can delete own files"
on storage.objects
for delete
using (
  bucket_id = 'app-data' and
  auth.uid()::text = (storage.foldername(name))[1]
);