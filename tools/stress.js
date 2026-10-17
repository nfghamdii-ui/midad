// اختبار ضغط محلي: يشغّل المحرر الحقيقي ببيانات "شهر استخدام كثيف" بدون خادم، ويقيس الأزمنة.
// الاستخدام: افتح tools/stress.html في المتصفح، والنتائج في window.STRESS وفي الـ console.
(function () {
  const T = {}, t0 = performance.now();
  const stable = v => Array.isArray(v) ? '[' + v.map(stable).join(',') + ']'
    : v && typeof v === 'object' ? '{' + Object.keys(v).sort().filter(k => v[k] !== undefined).map(k => JSON.stringify(k) + ':' + stable(v[k])).join(',') + '}'
    : JSON.stringify(v === undefined ? null : v);
  const sent = new Map(), raws = new Map(); let saves = 0, uploaded = 0, persistMs = [];
  const opts = {
    db: null,
    persist(db) {
      const a = performance.now(); let n = 0;
      for (const p of Object.values(db.pages)) { const raw = JSON.stringify(p); if (raws.get(p.id) === raw) continue; raws.set(p.id, raw); const j = stable(p); if (sent.get(p.id) !== j) { sent.set(p.id, j); n++; uploaded += j.length } }
      persistMs.push(performance.now() - a); saves++;
      return Promise.resolve(n);
    },
    cacheLocal() {},
    onReady(api) { window.API = api }
  };
  document.getElementById('boot').hidden = true;
  document.getElementById('app').hidden = false;
  window.startMidad(opts);
  T.boot = performance.now() - t0;

  const db = API.db, P = db.pages, uid = () => Math.random().toString(36).slice(2, 14), now = Date.now();
  const words = 'تحديث المورد الجديد اجتماع الفريق خطة الإطلاق مراجعة العقد تقرير الأداء متابعة العميل تحسين الواجهة اختبار النظام'.split(' ');
  const sentence = n => Array.from({ length: n }, () => words[Math.floor(Math.random() * words.length)]).join(' ');
  // ٣٠ يوماً × ١٢ صفحة يومياً، كل صفحة ٤٠ سطراً، بعضها متداخل
  const roots = Object.values(P).filter(p => !p.parent && !p.trashed);
  let made = 0;
  for (let d = 0; d < 30; d++) for (let k = 0; k < 12; k++) {
    const id = uid(), parent = Math.random() < .5 ? roots[Math.floor(Math.random() * roots.length)].id : (Object.keys(P)[Math.floor(Math.random() * Object.keys(P).length)]);
    const par = P[parent]; if (!par || par.isRow || par.kind === 'db') continue;
    P[id] = { id, parent, order: made, icon: '📄', title: 'ملاحظات ' + (d + 1) + '-' + k + ' ' + sentence(2), kind: 'page', created: now - d * 864e5, updated: now - d * 864e5, comments: [],
      blocks: Array.from({ length: 40 }, (_, i) => ({ id: uid(), type: i % 9 === 0 ? 'h2' : i % 5 === 0 ? 'todo' : 'p', html: sentence(14) })) };
    made++;
  }
  // جدول مهام يكبر إلى ١٢٠٠ صف
  const tdb = Object.values(P).find(p => p.kind === 'db' && !p.trashed);
  const tpl = Object.values(P).find(p => p.parent === tdb.id && p.isRow);
  for (let i = 0; i < 1200; i++) { const id = uid(); P[id] = Object.assign(JSON.parse(JSON.stringify(tpl)), { id, order: 1000 + i, title: 'مهمة ' + i + ' ' + sentence(3), created: now, updated: now }) }
  // صفحة طويلة جداً: ١٥٠٠ سطر
  const longId = uid();
  P[longId] = { id: longId, parent: null, order: 999, icon: '📚', title: 'دليل الفريق الطويل', kind: 'page', created: now, updated: now, comments: [],
    blocks: Array.from({ length: 1500 }, (_, i) => ({ id: uid(), type: i % 20 === 0 ? 'h2' : 'p', html: sentence(18) })) };

  const json = JSON.stringify(P);
  T.pages = Object.keys(P).length; T.dataMB = +(json.length / 1048576).toFixed(2);
  let a = performance.now(); API.save(); T.saveCall = performance.now() - a;
  a = performance.now(); API.openPage(Object.values(P).find(p => p.kind === 'page' && !p.parent && !p.trashed).id); T.openHome = performance.now() - a;
  a = performance.now(); API.openPage(tdb.id); T.openBigTable = performance.now() - a;
  a = performance.now(); API.openPage(longId); T.openLongPage = performance.now() - a;
  T.domNodes = document.getElementsByTagName('*').length;
  setTimeout(() => {
    // أول حفظ يرفع كل شيء؛ الحفظ التالي بعد تعديل حرف يقيس كلفة كشف التغيير
    P[longId].blocks[3].html += ' تعديل';
    API.save();
    setTimeout(() => {
      T.firstPersistMs = Math.round(persistMs[0]); T.editPersistMs = Math.round(persistMs[persistMs.length - 1]);
      T.saves = saves;
      Object.keys(T).forEach(k => { if (typeof T[k] === 'number') T[k] = Math.round(T[k] * 100) / 100 });
      window.STRESS = T; console.log('STRESS', JSON.stringify(T));
    }, 1200);
  }, 1200);
})();
