// خادم Supabase وهمي داخل الصفحة لاختبار التحرير الجماعي بدون إنترنت.
// يحاكي: الدخول، الأعضاء، pages + save_pages المشروط، الحدث اللحظي، والتخزين — بما يكفي لـ cloud.js.
(function () {
  const ME = { id: 'u-me', email: 'naif@test.sa' }, MATE = { id: 'u-mate', email: 'sara@test.sa' }, WS = '11111111-1111-1111-1111-111111111111';
  let tick = 0;
  const now = () => { tick++; const d = new Date(Date.UTC(2026, 9, 17, 12, 0, 0) + tick); return d.toISOString().replace('Z', '') + String(tick % 1000).padStart(3, '0') + '+00:00' };
  const server = { pages: new Map(), log: [], channels: [] };
  const clone = v => JSON.parse(JSON.stringify(v));

  function emit(row, type) {
    const payload = type === 'DELETE' ? { eventType: 'DELETE', old: { workspace_id: WS, id: row.id } } : { eventType: type, new: clone(row) };
    // تأخير شبكة عشوائي
    setTimeout(() => server.channels.forEach(ch => ch.pg && ch.pg(payload)), 30 + Math.random() * 120);
  }
  function write(id, data, by) {
    const old = server.pages.get(id);
    const row = { workspace_id: WS, id, data: clone(data), updated_at: now(), updated_by: by };
    server.pages.set(id, row);
    emit(row, old ? 'UPDATE' : 'INSERT');
    return row;
  }

  function builder(table) {
    const q = { table, op: 'select', filters: {}, inIds: null, range: null };
    const b = {
      select() { return b }, order() { return b }, limit() { return b },
      eq(k, v) { q.filters[k] = v; return b }, in(k, v) { q.inIds = v; return b }, range(a, z) { q.range = [a, z]; return b },
      delete() { q.op = 'delete'; return b }, insert(v) { q.op = 'insert'; q.val = v; return b }, upsert(v) { q.op = 'upsert'; q.val = v; return b },
      update(v) { q.op = 'update'; q.val = v; return b }, single() { q.single = true; return b },
      then(ok, bad) { return Promise.resolve(run(q)).then(ok, bad) }
    };
    return b;
  }
  function run(q) {
    if (q.table === 'members' && q.op === 'select') {
      if (q.filters.user_id) return { data: [{ role: 'owner', workspace: { id: WS, name: 'مساحة الاختبار' } }] };
      return { data: [{ user_id: ME.id, email: ME.email, role: 'owner' }, { user_id: MATE.id, email: MATE.email, role: 'editor' }] };
    }
    if (q.table === 'pages' && q.op === 'select') {
      const all = [...server.pages.values()].map(r => ({ id: r.id, data: clone(r.data), updated_at: r.updated_at }));
      return { data: q.range ? all.slice(q.range[0], q.range[1] + 1) : all };
    }
    if (q.table === 'pages' && q.op === 'delete') { (q.inIds || []).forEach(id => { if (server.pages.delete(id)) emit({ id }, 'DELETE') }); return { data: null } }
    if (q.table === 'page_versions') return { data: [] };
    if (q.table === 'invites') return { data: [] };
    return { data: [], error: null };
  }

  const client = {
    auth: {
      getSession: async () => ({ data: { session: { user: ME } } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signOut: async () => ({})
    },
    from: builder,
    async rpc(name, args) {
      await new Promise(r => setTimeout(r, 40 + Math.random() * 80));
      if (name === 'accept_invites') return { data: 0 };
      if (name === 'save_pages') {
        const saved = [], conflicts = [];
        for (const it of args.items) {
          const cur = server.pages.get(it.id);
          if (cur && (it.base == null || it.base !== cur.updated_at)) { conflicts.push({ id: it.id, data: clone(cur.data), at: cur.updated_at }); server.log.push('conflict ' + it.id); continue }
          if (!cur && it.base != null) { conflicts.push({ id: it.id, data: null, at: null }); continue }
          const row = write(it.id, it.data, ME.id);
          saved.push({ id: it.id, at: row.updated_at });
        }
        return { data: { saved, conflicts } };
      }
      return { data: null };
    },
    channel() {
      const ch = { pg: null, state: {} };
      const api = {
        on(kind, filter, cb) { if (kind === 'postgres_changes') ch.pg = cb; return api },
        subscribe(cb) { server.channels.push(ch); setTimeout(() => cb && cb('SUBSCRIBED')); return api },
        track() {}, presenceState: () => ({ [MATE.id]: [{ email: MATE.email, page: window.__matePage || null }] })
      };
      return api;
    },
    removeChannel() {},
    storage: { from: () => ({ upload: async () => ({}), createSignedUrl: async () => ({ data: { signedUrl: '' } }) }) }
  };
  window.supabase = { createClient: () => client };
  window.MIDAD_CONFIG = { url: 'https://mock.supabase.co', anonKey: 'mock', schema: 'midad' };

  // الزميلة الوهمية: تعدّل الصفحة على الخادم مباشرة كأنها متصفح آخر
  window.MOCK = {
    server, ME, MATE,
    mateEdit(pageId, fn) {
      const cur = server.pages.get(pageId); if (!cur) return;
      const d = clone(cur.data); fn(d); write(pageId, d, MATE.id);
    }
  };
})();
