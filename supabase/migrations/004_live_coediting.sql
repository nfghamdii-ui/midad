-- مداد 004: تحرير جماعي مباشر بدون ضياع تعديلات
-- الحفظ صار مشروطاً: تُكتب الصفحة فقط إذا لم يغيّرها أحد منذ آخر نسخة رآها المتصفح (base).
-- إن تغيّرت، تعود النسخة الأحدث في conflicts فيدمجها المتصفح سطراً بسطر ثم يعيد الحفظ.
-- security invoker: سياسات RLS في midad.pages تبقى هي الحَكَم.

create or replace function midad.save_pages(ws uuid, items jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  it        jsonb;
  cur_data  jsonb;
  cur_at    timestamptz;
  new_at    timestamptz;
  saved     jsonb := '[]'::jsonb;
  conflicts jsonb := '[]'::jsonb;
begin
  for it in select value from jsonb_array_elements(items) loop
    select p.data, p.updated_at into cur_data, cur_at
    from midad.pages p where p.workspace_id = ws and p.id = it->>'id'
    for update;

    if found then
      if it->>'base' is null or cur_at <> (it->>'base')::timestamptz then
        conflicts := conflicts || jsonb_build_object('id', it->>'id', 'data', cur_data, 'at', cur_at);
        continue;
      end if;
      update midad.pages set data = it->'data'
      where workspace_id = ws and id = it->>'id'
      returning updated_at into new_at;
    else
      if it->>'base' is not null then
        -- حُذفت من الخادم أثناء تعديلها هنا
        conflicts := conflicts || jsonb_build_object('id', it->>'id', 'data', null, 'at', null);
        continue;
      end if;
      insert into midad.pages (workspace_id, id, data) values (ws, it->>'id', it->'data')
      returning updated_at into new_at;
    end if;
    saved := saved || jsonb_build_object('id', it->>'id', 'at', new_at);
  end loop;
  return jsonb_build_object('saved', saved, 'conflicts', conflicts);
end $$;

revoke execute on function midad.save_pages(uuid, jsonb) from public, anon;
grant execute on function midad.save_pages(uuid, jsonb) to authenticated;

-- تحديث ذاكرة الـ API فوراً حتى تظهر الدوال والجداول الجديدة
notify pgrst, 'reload schema';
