-- مداد 003: تخزين الصور خارج الصفحات + سجل تعديلات الصفحات
-- آمن لإعادة التشغيل. لا يلمس جداول PQCS ولا حاوياته؛ كل سياسات التخزين هنا مقيّدة بحاوية "midad".

-- ---------- الصور ----------
-- المسار: <workspace_id>/<random>.jpg — والصلاحية مأخوذة من عضوية المساحة في أول جزء من المسار
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('midad', 'midad', false, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create or replace function midad.path_ws(path text)
returns uuid language plpgsql immutable set search_path = '' as $$
begin
  return split_part(path, '/', 1)::uuid;
exception when others then
  return null;
end $$;

drop policy if exists "midad images read"   on storage.objects;
drop policy if exists "midad images upload" on storage.objects;
drop policy if exists "midad images delete" on storage.objects;
create policy "midad images read" on storage.objects for select to authenticated
  using (bucket_id = 'midad' and midad.can_read(midad.path_ws(name)));
create policy "midad images upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'midad' and midad.can_write(midad.path_ws(name)));
create policy "midad images delete" on storage.objects for delete to authenticated
  using (bucket_id = 'midad' and midad.can_write(midad.path_ws(name)));

grant execute on function midad.path_ws(text) to authenticated;

-- ---------- سجل التعديلات ----------
create table if not exists midad.page_versions (
  id           bigint generated always as identity primary key,
  workspace_id uuid not null references midad.workspaces on delete cascade,
  page_id      text not null,
  data         jsonb not null,
  saved_at     timestamptz not null,
  saved_by     uuid references auth.users on delete set null,
  reason       text not null default 'edit' check (reason in ('edit','delete'))
);
create index if not exists page_versions_page_idx on midad.page_versions (workspace_id, page_id, saved_at desc);

-- لقطة من النسخة السابقة: كل ١٠ دقائق من تعديل نفس الشخص، أو عند انتقال التعديل لشخص آخر، وقبل أي حذف.
-- يُحتفظ بآخر ١٠٠ لقطة لكل صفحة ولمدة ٩٠ يوماً.
create or replace function midad.snapshot_page()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'DELETE' then
    insert into midad.page_versions (workspace_id, page_id, data, saved_at, saved_by, reason)
    values (old.workspace_id, old.id, old.data, old.updated_at, old.updated_by, 'delete');
    return old;
  end if;
  if old.data is distinct from new.data and (
       old.updated_at < now() - interval '10 minutes'
    or (old.updated_by is distinct from new.updated_by and old.updated_at < now() - interval '1 minute')
  ) then
    insert into midad.page_versions (workspace_id, page_id, data, saved_at, saved_by)
    values (old.workspace_id, old.id, old.data, old.updated_at, old.updated_by);
    delete from midad.page_versions v
    where v.workspace_id = old.workspace_id and v.page_id = old.id
      and (v.saved_at < now() - interval '90 days'
           or v.id in (select id from midad.page_versions
                       where workspace_id = old.workspace_id and page_id = old.id
                       order by saved_at desc offset 100));
  end if;
  return new;
end $$;
drop trigger if exists snapshot_page on midad.pages;
create trigger snapshot_page after update or delete on midad.pages
  for each row execute function midad.snapshot_page();

alter table midad.page_versions enable row level security;
drop policy if exists ver_select on midad.page_versions;
create policy ver_select on midad.page_versions for select to authenticated using (midad.can_read(workspace_id));
revoke all on midad.page_versions from public, anon, authenticated;
grant select on midad.page_versions to authenticated;
grant all on midad.page_versions to service_role;
revoke execute on function midad.snapshot_page() from public, anon, authenticated;

-- تحديث ذاكرة الـ API فوراً حتى تظهر الدوال والجداول الجديدة
notify pgrst, 'reload schema';
