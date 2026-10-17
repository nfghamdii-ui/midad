/* مداد — دمج ثلاثي (base / local / remote) لتحرير صفحة واحدة من أكثر من شخص في نفس الوقت.
   - المصفوفات التي عناصرها كائنات لها id (البلوكات، عناصر اللوحة، التعليقات، الخصائص، العروض) تُدمج عنصراً عنصراً.
   - الكائنات تُدمج مفتاحاً مفتاحاً.
   - تعارض حقيقي على نفس القيمة (نفس السطر عدّله الاثنان): نُبقي النسخة المحلية، لأن صاحبها يكتب فيها الآن،
     وتبقى نسخة الطرف الآخر محفوظة في سجل الصفحة. */
(function (root) {
'use strict';

function stable(v) {
  if (Array.isArray(v)) return '[' + v.map(stable).join(',') + ']';
  if (v && typeof v === 'object') return '{' + Object.keys(v).sort().filter(k => v[k] !== undefined).map(k => JSON.stringify(k) + ':' + stable(v[k])).join(',') + '}';
  return JSON.stringify(v === undefined ? null : v);
}
const eq = (a, b) => a === b || stable(a) === stable(b);
const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
const idList = a => Array.isArray(a) && a.every(x => isObj(x) && typeof x.id === 'string');

function merge3(base, local, remote) {
  if (eq(local, remote)) return local;
  if (base !== undefined && eq(local, base)) return remote;
  if (base !== undefined && eq(remote, base)) return local;
  if (idList(local) && idList(remote) && (local.length || remote.length)) return mergeList(idList(base) ? base : [], local, remote);
  if (isObj(local) && isObj(remote)) return mergeObj(isObj(base) ? base : undefined, local, remote);
  if (typeof base === 'string' && typeof local === 'string' && typeof remote === 'string') return mergeText(base, local, remote);
  return local;
}

// نفس السطر من شخصين: إن كان كل واحد يكتب في موضع مختلف منه، نطبّق التعديلين معاً
function edit(base, s) {
  let a = 0; const max = Math.min(base.length, s.length);
  while (a < max && base[a] === s[a]) a++;
  let z = 0;
  while (z < max - a && base[base.length - 1 - z] === s[s.length - 1 - z]) z++;
  return { from: a, to: base.length - z, text: s.slice(a, s.length - z) };
}
function mergeText(base, local, remote) {
  const l = edit(base, local), r = edit(base, remote);
  const apart = l.to < r.from || r.to < l.from || (l.from === l.to && r.from === r.to && l.from === r.from);
  if (!apart) return local;
  const [first, second] = l.from >= r.from ? [l, r] : [r, l];   // من الآخر للأول حتى لا تتزحزح المواضع
  let out = base.slice(0, first.from) + first.text + base.slice(first.to);
  out = out.slice(0, second.from) + second.text + out.slice(second.to);
  const tags = t => (t.match(/</g) || []).length === (t.match(/>/g) || []).length;
  return tags(out) ? out : local;
}

function mergeObj(base, local, remote) {
  const out = {}, keys = new Set([...Object.keys(local), ...Object.keys(remote)]);
  for (const k of keys) {
    const b = base ? base[k] : undefined, inL = k in local && local[k] !== undefined, inR = k in remote && remote[k] !== undefined;
    if (inL && inR) { out[k] = merge3(b, local[k], remote[k]); continue }
    if (inL) { if (b !== undefined && eq(local[k], b)) continue; out[k] = local[k]; continue }   // حذفه الطرف الآخر ولم نعدّله
    if (inR) { if (b !== undefined && eq(remote[k], b)) continue; out[k] = remote[k] }          // حذفناه ولم يعدّله الطرف الآخر
  }
  return out;
}

function mergeList(base, local, remote) {
  const B = new Map(base.map(x => [x.id, x])), L = new Map(local.map(x => [x.id, x])), R = new Map(remote.map(x => [x.id, x]));
  const keep = new Map();
  for (const [id, l] of L) {
    if (R.has(id)) keep.set(id, merge3(B.get(id), l, R.get(id)));
    else if (!B.has(id) || !eq(l, B.get(id))) keep.set(id, l);          // جديد عندنا، أو حذفه الآخر وقد عدّلناه
  }
  for (const [id, r] of R) {
    if (L.has(id)) continue;
    if (!B.has(id) || !eq(r, B.get(id))) keep.set(id, r);               // جديد عنده، أو حذفناه وقد عدّله
  }
  // الترتيب: نأخذ ترتيب الطرف الذي أعاد الترتيب، ونُدخل عناصر الطرف الآخر الجديدة بعد جارها السابق
  const sameOrder = (a, b) => a.filter(x => keep.has(x.id)).map(x => x.id).join() === b.filter(x => keep.has(x.id)).map(x => x.id).join();
  const remoteReordered = !sameOrder(remote.filter(x => B.has(x.id)), base);
  const [main, other] = remoteReordered ? [remote, local] : [local, remote];
  const order = main.map(x => x.id).filter(id => keep.has(id));
  const placed = new Set(order);
  let prev = null;
  for (const x of other) {
    if (!keep.has(x.id)) continue;
    if (!placed.has(x.id)) {
      const at = prev === null ? 0 : order.indexOf(prev) + 1;
      order.splice(at, 0, x.id); placed.add(x.id);
    }
    prev = x.id;
  }
  return order.map(id => keep.get(id));
}

const api = { merge3, stable };
if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.MidadMerge = api;
})(this);
