// node tests/merge.test.js — اختبارات الدمج الثلاثي
const assert = require('assert');
const { merge3 } = require('../js/merge.js');
const B = (id, html) => ({ id, type: 'p', html });
const page = blocks => ({ id: 'pg', title: 'خطة', blocks });
const ids = p => p.blocks.map(b => b.id + ':' + b.html).join(' | ');
let n = 0; const t = (name, fn) => { fn(); n++; console.log('✓', name) };

const base = page([B('a', 'أ'), B('b', 'ب'), B('c', 'ج')]);

t('شخصان يعدّلان سطرين مختلفين: يبقى التعديلان', () => {
  const l = page([B('a', 'أ — نايف'), B('b', 'ب'), B('c', 'ج')]);
  const r = page([B('a', 'أ'), B('b', 'ب'), B('c', 'ج — سارة')]);
  assert.strictEqual(ids(merge3(base, l, r)), 'a:أ — نايف | b:ب | c:ج — سارة');
});
t('كل واحد يضيف سطراً في مكان مختلف', () => {
  const l = page([B('a', 'أ'), B('x', 'جديد نايف'), B('b', 'ب'), B('c', 'ج')]);
  const r = page([B('a', 'أ'), B('b', 'ب'), B('c', 'ج'), B('y', 'جديد سارة')]);
  assert.strictEqual(ids(merge3(base, l, r)), 'a:أ | x:جديد نايف | b:ب | c:ج | y:جديد سارة');
});
t('أحدهما يحذف سطراً والآخر يعدّل سطراً آخر', () => {
  const l = page([B('a', 'أ'), B('c', 'ج')]);
  const r = page([B('a', 'أ!'), B('b', 'ب'), B('c', 'ج')]);
  assert.strictEqual(ids(merge3(base, l, r)), 'a:أ! | c:ج');
});
t('حذف سطر عدّله الطرف الآخر: لا يضيع التعديل', () => {
  const l = page([B('a', 'أ'), B('c', 'ج')]);
  const r = page([B('a', 'أ'), B('b', 'ب معدّل'), B('c', 'ج')]);
  assert.strictEqual(ids(merge3(base, l, r)), 'a:أ | b:ب معدّل | c:ج');
});
t('نفس السطر عدّله الاثنان: تبقى نسخة من يكتب الآن', () => {
  const l = page([B('a', 'نسختي'), B('b', 'ب'), B('c', 'ج')]);
  const r = page([B('a', 'نسخته'), B('b', 'ب'), B('c', 'ج')]);
  assert.strictEqual(merge3(base, l, r).blocks[0].html, 'نسختي');
});
t('العنوان والأيقونة والسطور تتغيّر معاً من شخصين', () => {
  const l = Object.assign(page(base.blocks), { title: 'خطة الإطلاق' });
  const r = Object.assign(page([B('a', 'أ'), B('b', 'ب'), B('c', 'ج'), B('d', 'د')]), { icon: '🚀' });
  const m = merge3(base, l, r);
  assert.deepStrictEqual([m.title, m.icon, m.blocks.length], ['خطة الإطلاق', '🚀', 4]);
});
t('إعادة ترتيب عند طرف وإضافة عند الآخر', () => {
  const l = page([B('c', 'ج'), B('a', 'أ'), B('b', 'ب')]);
  const r = page([B('a', 'أ'), B('b', 'ب'), B('z', 'ز'), B('c', 'ج')]);
  assert.strictEqual(ids(merge3(base, l, r)), 'c:ج | a:أ | b:ب | z:ز');
});
t('خصائص صف في جدول: عمودان مختلفان', () => {
  const b = { id: 'r', title: 'مهمة', props: { st: 'جديد', ow: 'نايف' } };
  const m = merge3(b, { ...b, props: { st: 'مكتمل', ow: 'نايف' } }, { ...b, props: { st: 'جديد', ow: 'سارة' } });
  assert.deepStrictEqual(m.props, { st: 'مكتمل', ow: 'سارة' });
});
t('عناصر اللوحة البيضاء: تحريك عنصر وإضافة عنصر', () => {
  const b = { id: 'w', items: [{ id: 's1', x: 0, y: 0 }] };
  const m = merge3(b, { id: 'w', items: [{ id: 's1', x: 50, y: 0 }] }, { id: 'w', items: [{ id: 's1', x: 0, y: 0 }, { id: 's2', x: 9, y: 9 }] });
  assert.deepStrictEqual(m.items, [{ id: 's1', x: 50, y: 0 }, { id: 's2', x: 9, y: 9 }]);
});
t('بدون نسخة أساس (صفحة جديدة عند الطرفين)', () => {
  const m = merge3(undefined, page([B('a', '1')]), page([B('b', '2')]));
  assert.strictEqual(m.blocks.length, 2);
});
console.log(n + ' اختبارات نجحت');

t('نفس السطر: واحد يكتب في أوله والآخر في آخره', () => {
  const l = page([B('a', 'مرحبا أ'), B('b', 'ب'), B('c', 'ج')]);
  const r = page([B('a', 'أ وأهلاً'), B('b', 'ب'), B('c', 'ج')]);
  assert.strictEqual(merge3(base, l, r).blocks[0].html, 'مرحبا أ وأهلاً');
});
t('نفس السطر ونفس الكلمة: تبقى نسخة من يكتب الآن', () => {
  const b0 = page([B('a', 'الموعد الأحد'), B('b', 'ب')]);
  const m = merge3(b0, page([B('a', 'الموعد الاثنين'), B('b', 'ب')]), page([B('a', 'الموعد الثلاثاء'), B('b', 'ب')]));
  assert.strictEqual(m.blocks[0].html, 'الموعد الاثنين');
});
t('نص فيه تنسيق HTML يبقى سليماً', () => {
  const b0 = page([B('a', 'نص <b>عريض</b> هنا')]);
  const m = merge3(b0, page([B('a', 'أول نص <b>عريض</b> هنا')]), page([B('a', 'نص <b>عريض</b> هنا آخر')]));
  assert.strictEqual(m.blocks[0].html, 'أول نص <b>عريض</b> هنا آخر');
});
console.log(n + ' اختبارات نجحت');
