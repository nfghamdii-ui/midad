-- إصلاح: إنشاء مساحة عمل كان يفشل بـ "new row violates row-level security policy for table workspaces"
-- لأن insert ... returning يتحقق من سياسة القراءة قبل أن تظهر عضوية المالك.
drop policy if exists ws_select on midad.workspaces;
create policy ws_select on midad.workspaces for select to authenticated
  using (created_by = auth.uid() or midad.can_read(id));
