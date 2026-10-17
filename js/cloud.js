/* مداد — طبقة السحابة: الدخول، مساحات العمل، المزامنة مع Supabase، التحديث اللحظي، ودعوة الفريق. */
(function () {
'use strict';
const cfg = window.MIDAD_CONFIG;
if (!cfg || /YOUR-/.test(cfg.url + cfg.anonKey)) {
  document.getElementById('bootMsg').textContent = 'لم يُضبط الاتصال بقاعدة البيانات بعد: عدّل js/config.js';
  return;
}
const sb = window.supabase.createClient(cfg.url, cfg.anonKey, {
  db: { schema: cfg.schema },
  auth: { persistSession: true, autoRefreshToken: true, storageKey: 'midad-auth' }
});
const $ = s => document.querySelector(s);
const PREFS = 'midad-prefs';
const LAST_WS = 'midad-last-ws';

const st = { user: null, ws: null, role: null, workspaces: [], sent: new Map(), queue: Promise.resolve(), channel: null, api: null, dirty: false, members: {}, raw: new Map() };

// حالة شخصية لكل مستخدم: لا تُرفع مع الصفحة حتى لا تتغير مفضلة زميلك أو شجرته أو موضعه في اللوحة
const PERSONAL = ['fav', 'open', 'cam', 'view'];
function shared(p) { const o = {}; for (const k in p) if (!PERSONAL.includes(k)) o[k] = p[k]; return o }
function personalOf(p) { const o = {}; PERSONAL.forEach(k => { if (p[k] !== undefined) o[k] = p[k] }); return o }
// ترتيب ثابت للمفاتيح: jsonb يعيد ترتيبها، فبدونه نخطئ في تمييز صدى تعديلاتنا
function stable(v) {
  if (Array.isArray(v)) return '[' + v.map(stable).join(',') + ']';
  if (v && typeof v === 'object') return '{' + Object.keys(v).sort().filter(k => v[k] !== undefined).map(k => JSON.stringify(k) + ':' + stable(v[k])).join(',') + '}';
  return JSON.stringify(v === undefined ? null : v);
}
const sig = p => stable(shared(p));

function readJSON(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d } catch (e) { return d } }
function writeJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) {} }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]) }
function arErr(e) {
  const m = (e && e.message) || String(e);
  if (/Invalid login credentials/i.test(m)) return 'البريد أو كلمة المرور غير صحيحة';
  if (/Email not confirmed/i.test(m)) return 'أكّد بريدك أولاً من الرسالة التي وصلتك';
  if (/User already registered/i.test(m)) return 'هذا البريد مسجّل مسبقاً، سجّل الدخول';
  if (/Password should be at least/i.test(m)) return 'كلمة المرور قصيرة (٦ أحرف على الأقل)';
  if (/Signups not allowed/i.test(m)) return 'التسجيل مغلق حالياً في الخادم';
  if (/Failed to fetch|NetworkError/i.test(m)) return 'تعذّر الاتصال بالخادم، تحقق من الإنترنت';
  return m;
}

/* ---------- شاشة الدخول ---------- */
let authMode = 'in';
function showAuth(msg) {
  $('#boot').hidden = true;
  $('#auth').hidden = false;
  setAuthMode(authMode);
  $('#authMsg').textContent = msg || '';
}
function setAuthMode(m) {
  authMode = m;
  $('#authTitle').textContent = m === 'in' ? 'تسجيل الدخول' : 'حساب جديد';
  $('#authSubmit').textContent = m === 'in' ? 'دخول' : 'إنشاء الحساب';
  $('#authSwitch').textContent = m === 'in' ? 'ما عندك حساب؟ أنشئ حساباً' : 'عندك حساب؟ سجّل الدخول';
  $('#authPass').autocomplete = m === 'in' ? 'current-password' : 'new-password';
}
$('#authSwitch').onclick = () => { setAuthMode(authMode === 'in' ? 'up' : 'in'); $('#authMsg').textContent = '' };
$('#authForm').onsubmit = async e => {
  e.preventDefault();
  const email = $('#authEmail').value.trim().toLowerCase(), password = $('#authPass').value;
  const btn = $('#authSubmit'); btn.disabled = true; $('#authMsg').textContent = '';
  try {
    if (authMode === 'in') {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } else {
      const { data, error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo: location.origin + location.pathname } });
      if (error) throw error;
      if (!data.session) { $('#authMsg').textContent = 'أرسلنا رابط تأكيد إلى بريدك. افتحه ثم سجّل الدخول.'; setAuthMode('in') }
    }
  } catch (err) { $('#authMsg').textContent = arErr(err) }
  btn.disabled = false;
};
$('#authReset').onclick = async () => {
  const email = $('#authEmail').value.trim().toLowerCase();
  if (!email) { $('#authMsg').textContent = 'اكتب بريدك أولاً'; return }
  const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname });
  $('#authMsg').textContent = error ? arErr(error) : 'أرسلنا رابط استعادة كلمة المرور إلى بريدك.';
};

/* ---------- مساحات العمل ---------- */
async function loadWorkspaces() {
  await sb.rpc('accept_invites');
  const { data, error } = await sb.from('members').select('role, workspace:workspaces(id, name)').eq('user_id', st.user.id);
  if (error) throw error;
  st.workspaces = data.filter(r => r.workspace).map(r => ({ id: r.workspace.id, name: r.workspace.name, role: r.role }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ar'));
}
async function createWorkspace(name) {
  const { data, error } = await sb.from('workspaces').insert({ name }).select('id, name').single();
  if (error) throw error;
  return data;
}

async function fetchPages(wsId) {
  const out = [];
  for (let from = 0; ; from += 500) {
    const { data, error } = await sb.from('pages').select('id, data').eq('workspace_id', wsId).range(from, from + 499);
    if (error) throw error;
    out.push(...data);
    if (data.length < 500) break;
  }
  return out;
}

/* ---------- المزامنة ---------- */
// نرسل فقط الصفحات التي تغيّر نصها منذ آخر إرسال، ونحذف ما اختفى محلياً
function persist(db) {
  const started = Date.now();
  const job = st.queue.then(async () => {
    const ws = st.ws.id, ups = [], seen = new Set();
    for (const p of Object.values(db.pages)) {
      seen.add(p.id);
      // فحص سريع أولاً (JSON الأصلي أسرع بكثير)، والترتيب الثابت فقط للصفحات التي تغيّرت فعلاً
      const raw = JSON.stringify(p);
      if (st.raw.get(p.id) === raw && st.sent.has(p.id)) continue;
      const j = sig(p);
      if (st.sent.get(p.id) !== j) ups.push({ workspace_id: ws, id: p.id, data: shared(p), _j: j, _raw: raw });
      else st.raw.set(p.id, raw);
    }
    const dels = [...st.sent.keys()].filter(id => !seen.has(id));
    for (let i = 0; i < ups.length; i += 100) {
      const chunk = ups.slice(i, i + 100);
      const { error } = await sb.from('pages').upsert(chunk.map(({ _j, _raw, ...r }) => r));
      if (error) throw error;
      chunk.forEach(r => { st.sent.set(r.id, r._j); st.raw.set(r.id, r._raw) });
    }
    if (dels.length) {
      const { error } = await sb.from('pages').delete().eq('workspace_id', ws).in('id', dels);
      if (error) throw error;
      dels.forEach(id => { st.sent.delete(id); st.raw.delete(id) });
    }
  });
  job.then(() => { if (st.dirtyAt <= started) st.dirty = false; clearTimeout(retryT) }, () => scheduleRetry());
  st.queue = job.catch(() => {});
  return job;
}
let retryT;
function scheduleRetry() {
  clearTimeout(retryT);
  retryT = setTimeout(() => { if (navigator.onLine && st.api) st.api.save() }, 8000);
}
addEventListener('online', () => { if (st.dirty && st.api) st.api.save() });
addEventListener('offline', () => { if (st.api) st.api.setStatus('غير متصل — التعديلات تنتظر') });
addEventListener('beforeunload', e => { if (st.dirty) { e.preventDefault(); e.returnValue = '' } });

function cacheLocal(db) {
  const prefs = readJSON(PREFS, {});
  prefs.theme = db.theme; prefs.collapsed = db.collapsed;
  prefs.current = Object.assign(prefs.current || {}, { [st.ws.id]: db.current });
  const mine = {};
  for (const p of Object.values(db.pages)) { const o = personalOf(p); if (Object.keys(o).length) mine[p.id] = o }
  prefs.personal = Object.assign(prefs.personal || {}, { [st.ws.id]: mine });
  writeJSON(PREFS, prefs);
}

/* ---------- الصور في Supabase Storage ---------- */
const BUCKET = 'midad', urlCache = new Map();
async function uploadImage(blob) {
  const path = st.ws.id + '/' + crypto.randomUUID() + '.jpg';
  const { error } = await sb.storage.from(BUCKET).upload(path, blob, { contentType: blob.type || 'image/jpeg', cacheControl: '31536000' });
  if (error) throw error;
  return 'sb:' + path;
}
function resolveImage(ref) {
  const path = ref.slice(3), hit = urlCache.get(path);
  if (hit && hit.exp > Date.now()) return hit.p;
  const p = sb.storage.from(BUCKET).createSignedUrl(path, 6 * 3600).then(({ data, error }) => { if (error) throw error; return data.signedUrl });
  urlCache.set(path, { p, exp: Date.now() + 5 * 3600e3 });
  p.catch(() => urlCache.delete(path));
  return p;
}
// نقل الصور القديمة المضمّنة داخل الصفحات (data:) إلى التخزين، صفحةً صفحة في الخلفية
async function migrateInlineImages() {
  if (st.role === 'viewer') return;
  const toBlob = d => fetch(d).then(r => r.blob());
  let moved = 0;
  for (const p of Object.values(st.api.db.pages)) {
    const spots = [];
    (p.blocks || []).forEach(b => { if (b.type === 'image' && typeof b.src === 'string' && b.src.startsWith('data:')) spots.push(b) });
    (p.items || []).forEach(i => { if (i.type === 'image' && typeof i.src === 'string' && i.src.startsWith('data:')) spots.push(i) });
    for (const o of spots) {
      try { o.src = await uploadImage(await toBlob(o.src)); moved++ } catch (e) { return }
    }
  }
  if (moved) st.api.save();
}

/* ---------- سلة المحذوفات: تُفرَّغ تلقائياً بعد ٣٠ يوماً ---------- */
function purgeOldTrash() {
  if (st.role === 'viewer') return;
  const limit = Date.now() - 30 * 864e5, db = st.api.db;
  const roots = Object.values(db.pages).filter(p => p.trashed && p.trashRoot === p.id && p.trashed < limit).map(p => p.id);
  if (!roots.length) return;
  const gone = Object.values(db.pages).filter(p => p.trashed && roots.includes(p.trashRoot)).map(p => p.id);
  st.api.applyRemote([], gone);
  st.api.save();
}

let remoteUps = new Map(), remoteDels = new Set(), remoteT;
function onRemote(payload) {
  if (!st.api) return;
  if (payload.eventType === 'DELETE') {
    const o = payload.old || {};
    if (o.workspace_id && o.workspace_id !== st.ws.id) return;
    if (!st.sent.has(o.id)) return;
    st.sent.delete(o.id); remoteDels.add(o.id); remoteUps.delete(o.id);
  } else {
    const r = payload.new;
    if (!r || r.workspace_id !== st.ws.id) return;
    const j = stable(r.data);
    if (st.sent.get(r.id) === j) return; // صدى تعديلنا نحن
    st.sent.set(r.id, j);
    const mine = st.api.db.pages[r.id];
    remoteUps.set(r.id, Object.assign(shared(r.data), mine ? personalOf(mine) : {})); remoteDels.delete(r.id);
    if (r.updated_by && r.updated_by !== st.user.id && st.api.page && st.api.page.id === r.id) noteRemoteEdit(r.updated_by);
  }
  clearTimeout(remoteT);
  remoteT = setTimeout(() => {
    const u = [...remoteUps.values()], d = [...remoteDels];
    remoteUps = new Map(); remoteDels = new Set();
    st.api.applyRemote(u, d);
  }, 200);
}
function subscribe() {
  if (st.channel) sb.removeChannel(st.channel);
  st.channel = sb.channel('midad-ws-' + st.ws.id, { config: { presence: { key: st.user.id } } })
    .on('postgres_changes', { event: '*', schema: cfg.schema, table: 'pages', filter: 'workspace_id=eq.' + st.ws.id }, onRemote)
    .on('presence', { event: 'sync' }, renderPresence)
    .subscribe(status => { if (status === 'SUBSCRIBED') trackPresence(true) });
  setInterval(() => trackPresence(false), 1500);
}

/* ---------- من معي الآن ---------- */
let lastTracked = null;
function trackPresence(force) {
  if (!st.channel || !st.api) return;
  const page = st.api.page ? st.api.page.id : null;
  if (!force && page === lastTracked) return;
  lastTracked = page;
  st.channel.track({ email: st.user.email, page });
}
function renderPresence() {
  let box = $('#presence');
  if (!box) { box = document.createElement('div'); box.id = 'presence'; box.className = 'presence'; $('#status').before(box) }
  const cur = st.api && st.api.page ? st.api.page.id : null, state = st.channel.presenceState(), here = [];
  for (const [uid, metas] of Object.entries(state)) {
    if (uid === st.user.id) continue;
    const m = metas[metas.length - 1];
    if (m && m.page === cur) here.push(m.email || '');
  }
  box.innerHTML = here.slice(0, 4).map(e => '<span class="pav" title="' + esc(e) + ' في هذه الصفحة الآن">' + esc(e.charAt(0).toUpperCase()) + '</span>').join('') + (here.length > 4 ? '<span class="pav more">+' + (here.length - 4) + '</span>' : '');
  box.hidden = !here.length;
}
setInterval(() => { if (st.channel) renderPresence() }, 2000);

let noteT = 0;
function noteRemoteEdit(uid) {
  if (Date.now() - noteT < 20000) return;
  noteT = Date.now();
  st.api.toast((st.members[uid] || 'زميلك') + ' يعدّل هذه الصفحة الآن. تعديلاتكما تُحفظ، وأي نسخة سابقة تجدها في سجل الصفحة.');
}

async function loadMembers() {
  const { data } = await sb.from('members').select('user_id, email').eq('workspace_id', st.ws.id);
  (data || []).forEach(m => { st.members[m.user_id] = m.email });
}

/* ---------- سجل الصفحة ---------- */
const CLOCK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/></svg>';
function setupHistoryButton() {
  if ($('#histBtn')) return;
  const b = document.createElement('button');
  b.className = 'ib'; b.id = 'histBtn'; b.title = 'سجل الصفحة'; b.setAttribute('aria-label', 'سجل الصفحة'); b.innerHTML = CLOCK;
  $('#comBtn').before(b);
  b.onclick = openHistory;
}
const fmtTime = t => new Date(t).toLocaleString('ar-SA-u-ca-gregory', { dateStyle: 'medium', timeStyle: 'short' });
function textOf(p) {
  return (p.blocks || []).map(b => (b.html || b.code || '').replace(/<[^>]+>/g, '')).filter(Boolean).join(' · ').slice(0, 220);
}
async function openHistory() {
  const p = st.api.page; if (!p) return;
  $('#wsModal').hidden = false;
  $('#wsModal h2').textContent = 'سجل «' + (p.title || 'بدون عنوان') + '»';
  const body = $('#wsBody'); body.innerHTML = '<p class="muted">تحميل…</p>';
  const { data, error } = await sb.from('page_versions').select('id, data, saved_at, saved_by, reason')
    .eq('workspace_id', st.ws.id).eq('page_id', p.id).order('saved_at', { ascending: false }).limit(100);
  if (error) { body.innerHTML = '<p class="muted">تعذّر تحميل السجل: ' + esc(arErr(error)) + '</p>'; return }
  if (!data.length) { body.innerHTML = '<p class="muted">لا توجد نسخ سابقة بعد. تُحفظ نسخة تلقائياً كل ١٠ دقائق من التعديل، وعند تعديل شخص آخر للصفحة.</p>'; return }
  body.innerHTML = '<ul class="hist">' + data.map(v => '<li><div><b>' + fmtTime(v.saved_at) + '</b><small>' + esc(st.members[v.saved_by] || '') + '</small><p>' + esc(textOf(v.data) || '(صفحة فارغة)') + '</p></div>' + (st.role !== 'viewer' ? '<button class="tb" data-v="' + v.id + '">استرجاع</button>' : '') + '</li>').join('') + '</ul>';
  body.querySelectorAll('[data-v]').forEach(btn => btn.onclick = () => {
    const v = data.find(x => String(x.id) === btn.dataset.v);
    if (!confirm('استرجاع نسخة ' + fmtTime(v.saved_at) + '؟ النسخة الحالية تبقى في السجل.')) return;
    const cur = st.api.db.pages[p.id];
    st.api.applyRemote([Object.assign(shared(v.data), cur ? personalOf(cur) : {}, { id: p.id, trashed: undefined, trashRoot: undefined, updated: Date.now() })], [], true);
    st.api.save();
    $('#wsModal').hidden = true; st.api.toast('تم الاسترجاع');
  });
}

/* ---------- تشغيل مساحة ---------- */
let started = false;
async function openWorkspace(ws) {
  if (started) { localStorage.setItem(LAST_WS, ws.id); location.reload(); return }
  st.ws = ws; st.role = ws.role;
  localStorage.setItem(LAST_WS, ws.id);
  $('#bootMsg').textContent = 'تحميل الصفحات…';
  const rows = await fetchPages(ws.id);
  const pages = {};
  const prefs = readJSON(PREFS, {});
  const mine = (prefs.personal || {})[ws.id] || {};
  rows.forEach(r => { st.sent.set(r.id, stable(r.data)); pages[r.id] = Object.assign(r.data, mine[r.id] || {}) });
  const db = rows.length ? { pages, current: (prefs.current || {})[ws.id], theme: prefs.theme || 'system', collapsed: prefs.collapsed, ver: 4 } : null;
  if (db && !pages[db.current]) db.current = Object.keys(pages)[0];
  $('#boot').hidden = true; $('#auth').hidden = true; $('#app').hidden = false;
  started = true;
  window.startMidad({
    db, persist, cacheLocal, uploadImage, resolveImage,
    markDirty() { st.dirty = true; st.dirtyAt = Date.now() },
    readOnly: st.role === 'viewer',
    onReady(api) {
      st.api = api;
      if (!rows.length && st.role !== 'viewer') api.save(); // مساحة جديدة: ارفع صفحات البداية
      if (st.role === 'viewer') api.setStatus('للقراءة فقط');
    }
  });
  renderAccount();
  subscribe();
  loadMembers();
  setupHistoryButton();
  setTimeout(() => { purgeOldTrash(); migrateInlineImages() }, 1500);
}

async function afterLogin(user) {
  st.user = user;
  $('#auth').hidden = true; $('#boot').hidden = false; $('#bootMsg').textContent = 'تجهيز مساحة العمل…';
  try {
    await loadWorkspaces();
    if (!st.workspaces.length) {
      const w = await createWorkspace('مساحة ' + (user.email || '').split('@')[0]);
      st.workspaces = [{ id: w.id, name: w.name, role: 'owner' }];
    }
    const last = localStorage.getItem(LAST_WS);
    await openWorkspace(st.workspaces.find(w => w.id === last) || st.workspaces[0]);
  } catch (e) {
    $('#bootMsg').textContent = 'تعذّر تحميل مساحة العمل: ' + arErr(e);
    $('#bootRetry').hidden = false;
  }
}
$('#bootRetry').onclick = () => location.reload();

/* ---------- قائمة الحساب والفريق ---------- */
function renderAccount() {
  const b = $('#wsBtn');
  b.innerHTML = '<span class="ws-av">' + esc((st.ws.name || 'م').trim().charAt(0)) + '</span><span class="sp"><b>' + esc(st.ws.name) + '</b><small>' + esc(st.user.email) + '</small></span>';
  b.hidden = false;
}
$('#wsBtn').onclick = () => openWsModal();
$('#wsClose').onclick = () => { $('#wsModal').hidden = true };
$('#wsModal').addEventListener('mousedown', e => { if (e.target.id === 'wsModal') $('#wsModal').hidden = true });

const ROLE = { owner: 'مالك', editor: 'محرر', viewer: 'قارئ' };
async function openWsModal() {
  $('#wsModal').hidden = false;
  $('#wsModal h2').textContent = 'مساحة العمل والفريق';
  const body = $('#wsBody'); body.innerHTML = '<p class="muted">تحميل…</p>';
  const isOwner = st.role === 'owner';
  const [{ data: mem }, inv] = await Promise.all([
    sb.from('members').select('user_id, email, role').eq('workspace_id', st.ws.id).order('joined_at'),
    isOwner ? sb.from('invites').select('email, role').eq('workspace_id', st.ws.id) : Promise.resolve({ data: [] })
  ]);
  let html = '<section><h3>مساحات العمل</h3><div class="ws-list">';
  st.workspaces.forEach(w => {
    html += '<button class="ws-item' + (w.id === st.ws.id ? ' on' : '') + '" data-ws="' + w.id + '"><span class="ws-av">' + esc(w.name.charAt(0)) + '</span><span>' + esc(w.name) + '</span><small>' + ROLE[w.role] + '</small></button>';
  });
  html += '</div><form class="ws-row" id="wsNewForm"><input id="wsNewName" placeholder="اسم مساحة جديدة" maxlength="80" required><button class="tb">إنشاء</button></form></section>';

  html += '<section><h3>أعضاء «' + esc(st.ws.name) + '»</h3><ul class="mem">';
  (mem || []).forEach(m => {
    const me = m.user_id === st.user.id;
    html += '<li><span>' + esc(m.email || '—') + (me ? ' <small>(أنت)</small>' : '') + '</span>';
    if (isOwner && !me && m.role !== 'owner') {
      html += '<select data-role="' + m.user_id + '"><option value="editor"' + (m.role === 'editor' ? ' selected' : '') + '>محرر</option><option value="viewer"' + (m.role === 'viewer' ? ' selected' : '') + '>قارئ</option></select><button class="lnk danger" data-kick="' + m.user_id + '">إزالة</button>';
    } else html += '<small>' + ROLE[m.role] + '</small>';
    html += '</li>';
  });
  (inv.data || []).forEach(i => {
    html += '<li class="pending"><span>' + esc(i.email) + ' <small>(بانتظار الدخول)</small></span><small>' + ROLE[i.role] + '</small><button class="lnk danger" data-uninv="' + esc(i.email) + '">إلغاء</button></li>';
  });
  html += '</ul>';
  if (isOwner) html += '<form class="ws-row" id="invForm"><input id="invEmail" type="email" placeholder="بريد زميلك" required><select id="invRole"><option value="editor">محرر</option><option value="viewer">قارئ</option></select><button class="tb">دعوة</button></form><p class="muted small">يدخل زميلك بهذا البريد (أو ينشئ حساباً به) فيجد المساحة تلقائياً.</p>';
  else if (st.role !== 'owner') html += '<button class="lnk danger" id="leaveWs">مغادرة هذه المساحة</button>';
  html += '</section>';

  html += '<section><h3>البيانات</h3><div class="ws-row"><button class="tb" id="expBtn">تصدير نسخة احتياطية (JSON)</button>' + (st.role !== 'viewer' ? '<label class="tb">استيراد<input type="file" id="impFile" accept="application/json,.json" hidden></label>' : '') + '</div></section>';
  html += '<section class="ws-foot"><button class="lnk" id="signOut">تسجيل الخروج</button></section>';
  body.innerHTML = html;

  body.querySelectorAll('[data-ws]').forEach(b => b.onclick = () => { const w = st.workspaces.find(x => x.id === b.dataset.ws); if (w.id !== st.ws.id) openWorkspace(w) });
  $('#wsNewForm').onsubmit = async e => {
    e.preventDefault();
    try { const w = await createWorkspace($('#wsNewName').value.trim()); openWorkspace({ id: w.id, name: w.name, role: 'owner' }) }
    catch (err) { st.api.toast(arErr(err)) }
  };
  body.querySelectorAll('[data-role]').forEach(s => s.onchange = async () => {
    const { error } = await sb.from('members').update({ role: s.value }).eq('workspace_id', st.ws.id).eq('user_id', s.dataset.role);
    st.api.toast(error ? arErr(error) : 'تم تحديث الصلاحية');
  });
  body.querySelectorAll('[data-kick]').forEach(b => b.onclick = async () => {
    if (!confirm('إزالة هذا العضو من المساحة؟')) return;
    const { error } = await sb.from('members').delete().eq('workspace_id', st.ws.id).eq('user_id', b.dataset.kick);
    if (error) st.api.toast(arErr(error)); else openWsModal();
  });
  body.querySelectorAll('[data-uninv]').forEach(b => b.onclick = async () => {
    const { error } = await sb.from('invites').delete().eq('workspace_id', st.ws.id).eq('email', b.dataset.uninv);
    if (error) st.api.toast(arErr(error)); else openWsModal();
  });
  if ($('#invForm')) $('#invForm').onsubmit = async e => {
    e.preventDefault();
    const email = $('#invEmail').value.trim().toLowerCase();
    const { error } = await sb.from('invites').upsert({ workspace_id: st.ws.id, email, role: $('#invRole').value });
    if (error) st.api.toast(arErr(error)); else { st.api.toast('تمت دعوة ' + email); openWsModal() }
  };
  if ($('#leaveWs')) $('#leaveWs').onclick = async () => {
    if (!confirm('مغادرة المساحة؟ لن ترى صفحاتها بعد ذلك.')) return;
    const { error } = await sb.from('members').delete().eq('workspace_id', st.ws.id).eq('user_id', st.user.id);
    if (error) st.api.toast(arErr(error)); else { localStorage.removeItem(LAST_WS); location.reload() }
  };
  $('#expBtn').onclick = () => {
    const blob = new Blob([JSON.stringify({ app: 'midad', version: 4, workspace: st.ws.name, exported_at: new Date().toISOString(), pages: st.api.db.pages }, null, 1)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'midad-' + st.ws.name.replace(/\s+/g, '-') + '-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  if ($('#impFile')) $('#impFile').onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    try {
      const o = JSON.parse(await f.text());
      const pages = o.pages || {};
      const n = Object.keys(pages).length;
      if (!n) throw new Error('الملف لا يحتوي صفحات');
      if (!confirm('استيراد ' + n + ' صفحة إلى «' + st.ws.name + '»؟ الصفحات بنفس المعرّف ستُستبدل.')) return;
      st.api.applyRemote(Object.values(pages), []);
      st.api.save();
      $('#wsModal').hidden = true; st.api.toast('تم الاستيراد');
    } catch (err) { st.api.toast('تعذّر الاستيراد: ' + arErr(err)) }
  };
  $('#signOut').onclick = async () => { await sb.auth.signOut(); localStorage.removeItem(LAST_WS); location.reload() };
}

/* ---------- البداية ---------- */
sb.auth.onAuthStateChange((event, session) => {
  if (event === 'PASSWORD_RECOVERY') {
    setTimeout(async () => {
      const p = prompt('اكتب كلمة المرور الجديدة (٦ أحرف على الأقل)');
      if (p) { const { error } = await sb.auth.updateUser({ password: p }); alert(error ? arErr(error) : 'تم تغيير كلمة المرور') }
    });
  }
  if (event === 'SIGNED_OUT') location.reload();
});
sb.auth.getSession().then(({ data }) => {
  if (data.session) afterLogin(data.session.user);
  else {
    showAuth();
    const sub = sb.auth.onAuthStateChange((ev, s) => { if (ev === 'SIGNED_IN' && s && !started) { sub.data.subscription.unsubscribe(); afterLogin(s.user) } });
  }
});
})();
