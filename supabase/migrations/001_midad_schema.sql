-- مداد: قاعدة بيانات معزولة داخل مشروع Supabase المشترك (PQCS)
-- كل شيء يعيش في مخطط "midad" مستقل، فلا تلمس هذه الهجرة أي جدول في public أو في مخططات PQCS.
-- التشغيل: الصق الملف كاملاً في SQL Editor ثم Run. آمن لإعادة التشغيل.

create schema if not exists midad;

-- ---------- الجداول ----------

create table if not exists midad.workspaces (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 80),
  created_by  uuid not null default auth.uid() references auth.users on delete cascade,
  created_at  timestamptz not null default now()
);

create table if not exists midad.members (
  workspace_id uuid not null references midad.workspaces on delete cascade,
  user_id      uuid not null references auth.users on delete cascade,
  role         text not null default 'editor' check (role in ('owner','editor','viewer')),
  email        text,
  joined_at    timestamptz not null default now(),
  primary key (workspace_id, user_id)
);
create index if not exists members_user_idx on midad.members (user_id);

create table if not exists midad.invites (
  workspace_id uuid not null references midad.workspaces on delete cascade,
  email        text not null check (email = lower(email)),
  role         text not null default 'editor' check (role in ('editor','viewer')),
  invited_by   uuid not null default auth.uid() references auth.users on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (workspace_id, email)
);

-- صفحة كاملة (بلوكاتها وعناصر اللوحة وتعليقاتها) في صف واحد
create table if not exists midad.pages (
  workspace_id uuid not null references midad.workspaces on delete cascade,
  id           text not null,
  data         jsonb not null,
  updated_at   timestamptz not null default now(),
  updated_by   uuid default auth.uid() references auth.users on delete set null,
  primary key (workspace_id, id)
);
create index if not exists pages_ws_updated_idx on midad.pages (workspace_id, updated_at desc);

-- ---------- دوال الصلاحيات ----------

create or replace function midad.role_in(ws uuid)
returns text language sql stable security definer set search_path = '' as $$
  select role from midad.members where workspace_id = ws and user_id = auth.uid()
$$;

create or replace function midad.can_read(ws uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from midad.members where workspace_id = ws and user_id = auth.uid())
$$;

create or replace function midad.can_write(ws uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from midad.members where workspace_id = ws and user_id = auth.uid() and role in ('owner','editor'))
$$;

create or replace function midad.is_owner(ws uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from midad.members where workspace_id = ws and user_id = auth.uid() and role = 'owner')
$$;

-- منشئ المساحة يصير مالكها تلقائياً
create or replace function midad.on_workspace_created()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into midad.members (workspace_id, user_id, role, email)
  values (new.id, new.created_by, 'owner', (select email from auth.users where id = new.created_by));
  return new;
end $$;
drop trigger if exists workspace_owner on midad.workspaces;
create trigger workspace_owner after insert on midad.workspaces
  for each row execute function midad.on_workspace_created();

-- ختم وقت التعديل وصاحبه من الخادم، لا من المتصفح
create or replace function midad.stamp_page()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end $$;
drop trigger if exists stamp_page on midad.pages;
create trigger stamp_page before insert or update on midad.pages
  for each row execute function midad.stamp_page();

-- عند الدخول: تحويل الدعوات المرسلة لبريد المستخدم إلى عضويات
create or replace function midad.accept_invites()
returns integer language plpgsql security definer set search_path = '' as $$
declare
  me_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  n integer;
begin
  if auth.uid() is null or me_email = '' then return 0; end if;
  with moved as (
    delete from midad.invites where email = me_email returning workspace_id, role
  )
  insert into midad.members (workspace_id, user_id, role, email)
  select workspace_id, auth.uid(), role, me_email from moved
  on conflict (workspace_id, user_id) do nothing;
  get diagnostics n = row_count;
  return n;
end $$;

-- ---------- RLS ----------

alter table midad.workspaces enable row level security;
alter table midad.members    enable row level security;
alter table midad.invites    enable row level security;
alter table midad.pages      enable row level security;

drop policy if exists ws_select on midad.workspaces;
drop policy if exists ws_insert on midad.workspaces;
drop policy if exists ws_update on midad.workspaces;
drop policy if exists ws_delete on midad.workspaces;
-- created_by = auth.uid() ضروري: insert ... returning يتحقق من القراءة قبل أن تظهر عضوية المالك التي يضيفها الـ trigger
create policy ws_select on midad.workspaces for select to authenticated using (created_by = auth.uid() or midad.can_read(id));
create policy ws_insert on midad.workspaces for insert to authenticated with check (created_by = auth.uid());
create policy ws_update on midad.workspaces for update to authenticated using (midad.is_owner(id)) with check (midad.is_owner(id));
create policy ws_delete on midad.workspaces for delete to authenticated using (midad.is_owner(id));

drop policy if exists mem_select on midad.members;
drop policy if exists mem_update on midad.members;
drop policy if exists mem_delete on midad.members;
create policy mem_select on midad.members for select to authenticated using (midad.can_read(workspace_id));
create policy mem_update on midad.members for update to authenticated
  using (midad.is_owner(workspace_id) and user_id <> auth.uid())
  with check (midad.is_owner(workspace_id) and role in ('editor','viewer'));
-- المالك يزيل الأعضاء، والعضو يغادر بنفسه (المالك لا يغادر حتى لا تبقى المساحة بلا مالك)
create policy mem_delete on midad.members for delete to authenticated
  using ((midad.is_owner(workspace_id) and user_id <> auth.uid()) or (user_id = auth.uid() and role <> 'owner'));

drop policy if exists inv_select on midad.invites;
drop policy if exists inv_insert on midad.invites;
drop policy if exists inv_delete on midad.invites;
create policy inv_select on midad.invites for select to authenticated using (midad.is_owner(workspace_id));
create policy inv_insert on midad.invites for insert to authenticated with check (midad.is_owner(workspace_id) and invited_by = auth.uid());
create policy inv_delete on midad.invites for delete to authenticated using (midad.is_owner(workspace_id));

drop policy if exists pg_select on midad.pages;
drop policy if exists pg_insert on midad.pages;
drop policy if exists pg_update on midad.pages;
drop policy if exists pg_delete on midad.pages;
create policy pg_select on midad.pages for select to authenticated using (midad.can_read(workspace_id));
create policy pg_insert on midad.pages for insert to authenticated with check (midad.can_write(workspace_id));
create policy pg_update on midad.pages for update to authenticated using (midad.can_write(workspace_id)) with check (midad.can_write(workspace_id));
create policy pg_delete on midad.pages for delete to authenticated using (midad.can_write(workspace_id));

-- ---------- الصلاحيات على المخطط ----------
-- anon لا يصل لشيء إطلاقاً؛ authenticated يمر عبر RLS فقط

revoke all on schema midad from public, anon;
grant usage on schema midad to authenticated, service_role;
revoke all on all tables in schema midad from public, anon;
grant select, insert, update, delete on all tables in schema midad to authenticated;
grant all on all tables in schema midad to service_role;
revoke execute on all functions in schema midad from public, anon;
grant execute on function midad.accept_invites() to authenticated;
grant execute on function midad.role_in(uuid), midad.can_read(uuid), midad.can_write(uuid), midad.is_owner(uuid) to authenticated;

-- ---------- التحديث اللحظي ----------
alter table midad.pages replica identity full;
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'midad' and tablename = 'pages') then
    alter publication supabase_realtime add table midad.pages;
  end if;
end $$;
