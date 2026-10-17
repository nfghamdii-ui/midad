// يبني tools/coedit.bundle.html: التطبيق الحقيقي + cloud.js على خادم وهمي، في ملف واحد
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), rd = f => fs.readFileSync(path.join(root, f), 'utf8');
let h = rd('index.html');
h = h.replace(/<link rel="stylesheet" href="(css\/[a-z]+\.css)">/g, (m, f) => '<style>' + rd(f) + '</style>');
h = h.replace(/<script src="https:\/\/cdn[^>]*><\/script>/, () => '<script>' + rd('tools/mock-supabase.js') + '</script>');
h = h.replace('<script src="js/config.js"></script>', '');
for (const f of ['js/merge.js', 'js/app.js', 'js/cloud.js']) h = h.replace('<script src="' + f + '"></script>', () => '<script>' + rd(f) + '</script>');
h = h.replace('<title>مداد</title>', '<title>مداد — اختبار التحرير الجماعي</title>');
fs.writeFileSync(path.join(__dirname, 'coedit.bundle.html'), h);
console.log('built', h.length);
