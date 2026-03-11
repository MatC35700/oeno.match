-- Bucket pour les photos de vins (étiquettes + carousel)
insert into storage.buckets (id, name, public)
values ('wine-labels', 'wine-labels', true)
on conflict (id) do update set public = true;

-- Policy: les utilisateurs authentifiés peuvent uploader dans leur dossier (user_id = auth.uid())
create policy "wine-labels insert own"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'wine-labels'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: lecture publique (bucket public, mais RLS peut bloquer sans policy select)
create policy "wine-labels select public"
on storage.objects for select
to public
using (bucket_id = 'wine-labels');

-- Policy: update/delete uniquement dans son dossier
create policy "wine-labels update own"
on storage.objects for update
to authenticated
using (
  bucket_id = 'wine-labels'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "wine-labels delete own"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'wine-labels'
  and (storage.foldername(name))[1] = auth.uid()::text
);
