/* مداد — منطق المحرر. يبدأ عبر startMidad(opts) بعد أن يجهّز cloud.js المستخدم والمساحة والبيانات.
   opts: { db, persist(db), cacheLocal(db), readOnly, onReady(api) } */
window.startMidad=function(opts){
'use strict';
const $=s=>document.querySelector(s);
function h(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e}
const uid=()=>crypto.getRandomValues(new Uint32Array(3)).reduce((a,n)=>a+n.toString(36).padStart(7,'0'),'').slice(0,14);
const ar=n=>Number(n).toLocaleString('ar-SA',{useGrouping:false});
const arn=n=>Number(n).toLocaleString('ar-SA');
const PCE=(()=>{const d=document.createElement('div');try{d.contentEditable='plaintext-only'}catch(e){}return d.contentEditable==='plaintext-only'?'plaintext-only':'true'})();
const S=(d,w)=>'<svg width="'+(w||16)+'" height="'+(w||16)+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">'+d+'</svg>';
const IC={
  search:S('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
  plus:S('<path d="M12 5v14M5 12h14"/>'),
  trash:S('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'),
  star:S('<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',17),
  starF:'<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>',
  chat:S('<path d="M20 15a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z"/>',17),
  dots:S('<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',17),
  chev:S('<path d="m15 6-6 6 6 6"/>',12),
  dbl:S('<path d="m6 17 5-5-5-5M13 17l5-5-5-5"/>'),
  menu:S('<path d="M4 6h16M4 12h16M4 18h16"/>',18),
  x:S('<path d="M6 6l12 12M18 6 6 18"/>',14),
  open:S('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',12),
  grip:'<svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor"><circle cx="3" cy="3" r="1.4"/><circle cx="9" cy="3" r="1.4"/><circle cx="3" cy="8" r="1.4"/><circle cx="9" cy="8" r="1.4"/><circle cx="3" cy="13" r="1.4"/><circle cx="9" cy="13" r="1.4"/></svg>',
  table:S('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/>',15),
  board:S('<rect x="3" y="4" width="5" height="14" rx="1"/><rect x="10" y="4" width="5" height="10" rx="1"/><rect x="17" y="4" width="4" height="7" rx="1"/>',15),
  cal:S('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',15),
  list:S('<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',15),
  gallery:S('<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/>',15),
  sort:S('<path d="M7 4v16M3 16l4 4 4-4M17 20V4M13 8l4-4 4 4"/>',14),
  check:S('<path d="m5 12 5 5 9-10"/>',14),
  checkB:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg>',
  sun:S('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  moon:S('<path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/>'),
  auto:S('<circle cx="12" cy="12" r="9"/><path d="M12 3v18" /><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>'),
  copy:S('<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',15),
  lock:S('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',15),
  width:S('<path d="M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4"/>',15),
  data:S('<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',15),
  keys:S('<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',15),
  dup:S('<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M4 16V5a1 1 0 0 1 1-1h11"/>',15),
  up:S('<path d="M12 19V5M5 12l7-7 7 7"/>',15),
  down:S('<path d="M12 5v14M19 12l-7 7-7-7"/>',15),
  restore:S('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',15),
  image:S('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',15),
  smile:S('<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>',15),
  color:S('<path d="M5 20h14M8 16l4-12 4 12M9.5 12h5"/>',15),
  bold:S('<path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z"/>',15),
  italic:S('<path d="M10 5h8M6 19h8M14 5l-4 14"/>',15),
  under:S('<path d="M7 4v7a5 5 0 0 0 10 0V4M5 20h14"/>',15),
  strike:S('<path d="M5 12h14M16 7a4 4 0 0 0-4-3c-2.5 0-4 1.5-4 3.2 0 1.6 1.1 2.4 3 2.9M8 17a4 4 0 0 0 4 3c2.6 0 4.2-1.5 4.2-3.3"/>',15),
  code:S('<path d="m8 8-4 4 4 4M16 8l4 4-4 4"/>',15),
  link:S('<path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1"/>',15)
};

const COLORS=[['gray','رمادي'],['brown','بني'],['orange','برتقالي'],['yellow','أصفر'],['green','أخضر'],['blue','أزرق'],['purple','بنفسجي'],['pink','وردي'],['red','أحمر']];
const COVERS=[['dunes','الكثبان'],['sea','البحر الأحمر'],['ula','العُلا'],['night','ليل الصحراء'],['palm','النخيل'],['sarawat','جبال السروات'],['dawn','الفجر'],['mist','الضباب']];
const ICONS=['📄','✍️','🚀','🗒️','💡','📌','📚','🗂️','🗃️','✅','📈','🧭','🛠️','🎯','🗓️','💬','🔒','🌴','☕','🏗️','📦','🧪','🧾','🌙','⭐','🐪','🌵','🕌','🏜️','⛰️','🌊','🔥','💼','🎨','📣','🤝','🧠','📝','🔍','⚙️'];
const TYPES=[
  {t:'p',label:'نص',hint:'فقرة عادية',g:'¶',k:'',keys:'text paragraph نص فقرة'},
  {t:'h1',label:'عنوان كبير',hint:'عنوان قسم رئيسي',g:'ع١',k:'#',keys:'h1 heading عنوان'},
  {t:'h2',label:'عنوان متوسط',hint:'عنوان قسم',g:'ع٢',k:'##',keys:'h2 heading عنوان'},
  {t:'h3',label:'عنوان صغير',hint:'عنوان فرعي',g:'ع٣',k:'###',keys:'h3 heading عنوان'},
  {t:'ul',label:'قائمة نقطية',hint:'عناصر بلا ترتيب',g:'•',k:'-',keys:'bullet list قائمة نقطية'},
  {t:'ol',label:'قائمة مرقمة',hint:'عناصر بترتيب',g:'١.',k:'1.',keys:'number ordered list قائمة مرقمة'},
  {t:'todo',label:'قائمة مهام',hint:'مهام بمربعات اختيار',g:'☐',k:'[]',keys:'todo task check مهام مهمة'},
  {t:'toggle',label:'قائمة قابلة للطي',hint:'تخفي ما تحتها وتظهره',g:'▸',k:'>>',keys:'toggle collapse طي قابلة'},
  {t:'quote',label:'اقتباس',hint:'نص مقتبس',g:'❝',k:'>',keys:'quote اقتباس'},
  {t:'callout',label:'تنبيه',hint:'ملاحظة بارزة بأيقونة',g:'!',k:'',keys:'callout note تنبيه ملاحظة'},
  {t:'code',label:'كود',hint:'يُكتب من اليسار لليمين',g:'</>',k:'```',keys:'code كود برمجة'},
  {t:'divider',label:'فاصل',hint:'خط يفصل الأقسام',g:'—',k:'---',keys:'divider line فاصل خط'},
  {t:'image',label:'صورة',hint:'ارفع صورة من جهازك',g:'▣',k:'',keys:'image picture صورة'},
  {t:'page',label:'صفحة فرعية',hint:'صفحة داخل هذه الصفحة',g:'▤',k:'',keys:'page sub صفحة فرعية'},
  {t:'db',label:'قاعدة بيانات',hint:'جدول ولوحة وتقويم',g:'▦',k:'',keys:'database table board calendar قاعدة بيانات جدول'},
  {t:'wb',label:'ملاحظة لاصقة هنا',hint:'ملاحظة حرة بجانب هذا السطر',g:'◫',k:'',keys:'sticky note whiteboard miro canvas لوحة بيضاء رسم ملاحظة لاصقة'}
];
const LINKT=['page','db','wb'];
const TMAP=Object.fromEntries(TYPES.map(x=>[x.t,x]));
const PH={p:'اكتب شيئاً، أو اضغط / للأوامر و@ للإشارة لصفحة',h1:'عنوان كبير',h2:'عنوان متوسط',h3:'عنوان صغير',ul:'عنصر',ol:'عنصر',todo:'مهمة',toggle:'عنوان القائمة القابلة للطي',quote:'اقتباس',callout:'اكتب ملاحظة',code:'// اكتب الكود هنا'};
const PTYPES=[['text','نص','≡'],['number','رقم','#'],['select','اختيار','◉'],['multi','اختيار متعدد','☷'],['date','تاريخ','▦'],['checkbox','مربع اختيار','☑'],['person','شخص','◍'],['url','رابط','↗']];
const PG={title:'Aa'};PTYPES.forEach(p=>PG[p[0]]=p[2]);
const VTYPES=[['table','جدول','table'],['board','لوحة','board'],['calendar','تقويم','cal'],['list','قائمة','list'],['gallery','معرض','gallery']];
const MONTHS=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const DAYS=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
const ABJAD='أبجدهوزحطيكلمنسعفصقرشتثخذضظغ';
const TEXTY=t=>!['divider','page','db','image','wb'].includes(t);

/* ---------- small utils ---------- */
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const addDays=n=>{const d=new Date();d.setDate(d.getDate()+n);return iso(d)};
const parseISO=s=>{const[y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
function fmtDate(s){if(!s||!/^\d{4}-\d{2}-\d{2}$/.test(s))return '';const[y,m,d]=s.split('-').map(Number);return ar(d)+' '+MONTHS[m-1]+' '+ar(y)}
function hijri(d){try{return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura',{month:'long',year:'numeric'}).format(d)}catch(e){return ''}}
function rel(ts){if(!ts)return '';const s=(ts-Date.now())/1000;const a=Math.abs(s);const f=new Intl.RelativeTimeFormat('ar',{numeric:'auto'});
  if(a<45)return 'الآن';if(a<3600)return f.format(Math.round(s/60),'minute');if(a<86400)return f.format(Math.round(s/3600),'hour');if(a<2592000)return f.format(Math.round(s/86400),'day');return f.format(Math.round(s/2592000),'month')}
function dirOf(t){const m=(t||'').match(/[A-Za-zÀ-ɏ֐-ࣿיִ-ﻼ]/);if(!m)return 'rtl';return /[A-Za-zÀ-ɏ]/.test(m[0])?'ltr':'rtl'}

/* ---------- html sanitising ---------- */
const ALLOW={B:[],STRONG:[],I:[],EM:[],U:[],S:[],STRIKE:[],CODE:[],A:['href','target','rel'],SPAN:['class','data-page','contenteditable'],BR:[]};
function clean(node){
  [...node.childNodes].forEach(n=>{
    if(n.nodeType===3)return;
    if(n.nodeType!==1){n.remove();return}
    clean(n);
    const ok=ALLOW[n.tagName];
    if(!ok){n.replaceWith(...n.childNodes);return}
    [...n.attributes].forEach(a=>{if(!ok.includes(a.name))n.removeAttribute(a.name)});
    if(n.tagName==='A'){const hr=n.getAttribute('href')||'';if(!/^(https?:|mailto:)/i.test(hr))n.removeAttribute('href');n.setAttribute('target','_blank');n.setAttribute('rel','noopener')}
    if(n.tagName==='SPAN'){
      const cls=(n.getAttribute('class')||'').split(/\s+/).filter(c=>/^(c|bg)-[a-z]+$/.test(c)||c==='mention');
      if(!cls.length){n.replaceWith(...n.childNodes);return}
      n.setAttribute('class',cls.join(' '));
      if(cls.includes('mention'))n.setAttribute('contenteditable','false');else n.removeAttribute('contenteditable');
    }
    if(n.tagName!=='BR'&&!n.textContent&&!(n.tagName==='SPAN'&&n.classList.contains('mention')))n.remove();
  });
}
function sanitize(html){const t=document.createElement('template');t.innerHTML=html||'';clean(t.content);return t.innerHTML}
function htmlText(html){const t=document.createElement('template');t.innerHTML=html||'';t.content.querySelectorAll('.mention').forEach(m=>{const p=db.pages[m.dataset.page];m.textContent=p?'@'+tt(p):''});t.content.querySelectorAll('br').forEach(b=>b.replaceWith('\n'));return t.content.textContent}
function btxt(b){return b.type==='code'?(b.code||''):htmlText(b.html)}

/* ---------- seed ---------- */
function seed(){
  const P={},now=Date.now();
  const B=(type,html,x)=>Object.assign({id:uid(),type,html:html||''},x||{});
  const mk=o=>{const p=Object.assign({id:uid(),parent:null,order:0,icon:'📄',title:'',blocks:[],kind:'page',created:now,updated:now,comments:[]},o);P[p.id]=p;return p};
  const home=mk({icon:'✍️',title:'مرحباً في مداد',open:true,cover:'dunes'});
  const plan=mk({parent:home.id,order:0,icon:'🚀',title:'خطة نقل التطبيق'});
  const notes=mk({parent:home.id,order:1,icon:'🗒️',title:'ملاحظات الاجتماع'});
  const proj=mk({parent:home.id,order:2,icon:'🗃️',title:'مشاريع الفريق',kind:'db'});
  const ideas=mk({order:1,icon:'💡',title:'أفكار للمنتج',fav:true});
  const board=mk({parent:home.id,order:3,icon:'🎨',title:'لوحة الأفكار',mode:'canvas',blocks:boardSummaryBlocks(),items:boardSeedFull(proj.id)});
  const st={id:'st',name:'الحالة',type:'select',options:[{id:'s1',name:'لم يبدأ',color:'gray'},{id:'s2',name:'قيد التنفيذ',color:'blue'},{id:'s3',name:'مكتمل',color:'green'}]};
  const pr={id:'pr',name:'الأولوية',type:'select',options:[{id:'p1',name:'عالية',color:'red'},{id:'p2',name:'متوسطة',color:'yellow'},{id:'p3',name:'منخفضة',color:'gray'}]};
  proj.schema=[{id:'title',name:'المهمة',type:'title'},st,pr,{id:'ow',name:'المسؤول',type:'person'},{id:'du',name:'الموعد',type:'date'},
    {id:'tg',name:'الوسوم',type:'multi',options:[{id:'t1',name:'تقني',color:'blue'},{id:'t2',name:'تصميم',color:'pink'},{id:'t3',name:'تسويق',color:'orange'},{id:'t4',name:'نظامي',color:'purple'}]},
    {id:'pg',name:'نسبة الإنجاز',type:'number'}];
  proj.views=[{id:'v1',name:'كل المهام',type:'table'},{id:'v2',name:'حسب الحالة',type:'board',groupBy:'st'},{id:'v3',name:'التقويم',type:'calendar',dateProp:'du'},{id:'v4',name:'قائمة',type:'list'},{id:'v5',name:'معرض',type:'gallery'}];
  proj.view='v1';
  let o=0;const R=(title,props,blocks)=>mk({parent:proj.id,isRow:true,order:o++,title,icon:'',props,blocks:blocks||[B('p','')]});
  R('تجهيز سيرفر داخل السعودية',{st:'s3',pr:'p1',ow:'نواف',du:addDays(-6),tg:['t1'],pg:100},[B('p','تم اختيار مزوّد في جدة، والتأكد كتابياً من موقع مركز البيانات.'),B('todo','ذاكرة 8 جيجا وتخزين 100 جيجا',{checked:true})]);
  R('نقل قاعدة البيانات',{st:'s2',pr:'p1',ow:'نواف',du:addDays(2),tg:['t1'],pg:60},[B('p','تصدير الجداول والمستخدمين من المشروع الحالي ثم استيرادها.'),B('code','',{code:'pg_dump "$OLD_DB_URL" > backup.sql'})]);
  R('مراجعة سياسة الخصوصية',{st:'s2',pr:'p2',ow:'سارة',du:addDays(5),tg:['t4'],pg:30});
  R('تصميم لوحة التحكم بالعربي',{st:'s1',pr:'p2',ow:'ريم',du:addDays(9),tg:['t2'],pg:0},[B('p','الأولوية لدعم الكتابة من اليمين لليسار وخلط العربي بالإنجليزي.')]);
  R('نسخ احتياطي يومي داخل المملكة',{st:'s1',pr:'p1',ow:'نواف',du:addDays(12),tg:['t1'],pg:0});
  R('التسجيل لدى الهيئة',{st:'s2',pr:'p2',ow:'سارة',du:addDays(15),tg:['t4'],pg:40});
  R('صفحة هبوط للإطلاق',{st:'s1',pr:'p3',ow:'خالد',du:addDays(20),tg:['t2','t3'],pg:0});
  const men=id=>'<span class="mention" data-page="'+id+'" contenteditable="false"></span>';
  home.blocks=[
    B('p','هذه مساحة عمل مثال. كل سطر هنا <b>بلوك</b> مستقل: تقدر تغيّر نوعه، تلوّنه، تسحبه لمكان ثاني، أو تزيحه للداخل.'),
    B('callout','حدّد أي نص لتظهر أدوات التنسيق: <b>عريض</b>، <i>مائل</i>، <span class="c-blue">ملوّن</span>، <span class="bg-yellow">مظلّل</span>، <code>كود</code>، أو رابط.',{icon:'💡'}),
    B('h2','ابدأ من هنا'),
    B('todo','اكتب <code>/</code> في سطر فارغ لتظهر كل أنواع البلوكات'),
    B('todo','اكتب <code>@</code> لتشير إلى صفحة ثانية، مثل '+men(plan.id)),
    B('todo','اسحب أي سطر من مقبض النقاط بجانبه، أو اضغطه لقائمة الخيارات'),
    B('todo','اضغط <code>Tab</code> لإزاحة السطر للداخل و<code>Ctrl K</code> للبحث السريع',{checked:true}),
    B('toggle','قائمة قابلة للطي: اضغط السهم',{open:false}),
    B('p','كل سطر مُزاح تحت القائمة يختفي ويظهر معها.',{indent:1}),
    B('ul','ويمكن أن يكون من أي نوع',{indent:1}),
    B('h2','قاعدة بيانات داخل الصفحة'),
    B('p','جرّب التبديل بين الجدول واللوحة والتقويم، واسحب البطاقات بين الأعمدة أو الأيام.',{color:'c-gray'}),
    B('db','',{pageId:proj.id}),
    B('h2','المستند واللوحة معاً'),
    B('p','كل صفحة لها وجهان: <b>مستند</b> و<b>لوحة</b>، تبدّل بينهما من أعلى الصفحة. في اللوحة يبقى المستند والجداول حيّة قابلة للتعديل، وتضع فوقها ملاحظات وأسهماً.',{color:'c-gray'}),
    B('wb','',{pageId:board.id}),
    B('h2','صفحات فرعية'),
    B('page','',{pageId:plan.id}),
    B('page','',{pageId:notes.id}),
    B('divider'),
    B('p','العربي والإنجليزي معاً: كل سطر يأخذ اتجاهه من أول كلمة فيه، حتى لو فيه Supabase أو PostgreSQL.'),
    B('p','This line starts in English, so it flows left to right automatically.')
  ];
  plan.blocks=[
    B('callout','تابع تفاصيل كل مهمة في '+men(proj.id)+'.',{icon:'📌',color:'bg-blue'}),
    B('h1','المرحلة الأولى'),
    B('todo','تجهيز سيرفر داخل السعودية',{checked:true}),
    B('todo','تشغيل النسخة المفتوحة المصدر'),
    B('todo','نسخ احتياطي يومي داخل المملكة'),
    B('todo','تجربة التطبيق مع المستخدمين العشرة'),
    B('h2','خطوات النقل'),
    B('ol','تصدير قاعدة البيانات من المشروع الحالي'),
    B('ol','استيرادها على السيرفر الجديد'),
    B('ol','الجداول',{indent:1}),B('ol','حسابات المستخدمين',{indent:1}),
    B('ol','نقل الملفات المخزّنة'),
    B('ol','تغيير الرابط والمفتاح في التطبيق'),
    B('code','',{code:'pg_dump "$OLD_DB_URL" > backup.sql\npsql "$NEW_DB_URL" < backup.sql'})
  ];
  notes.blocks=[
    B('quote','البيانات الشخصية للمستخدمين تبقى داخل المملكة، بما فيها <b>النسخ الاحتياطية</b>.'),
    B('h3','قرارات'),
    B('ul','نبدأ بسيرفر واحد ثم نضيف سيرفراً احتياطياً'),
    B('ul','لوحة التحكم بالعربي من اليوم الأول'),
    B('h3','مهام'),
    B('todo','تحديد موعد مع المحامي'),
    B('divider'),
    B('p','الاجتماع القادم بعد أسبوعين.',{color:'c-gray'})
  ];
  notes.comments=[{id:uid(),text:'هل نحتاج سيرفراً احتياطياً من البداية، أو ننتظر أول عملاء؟',at:now-5400e3}];
  ideas.blocks=[B('ul','دعم ممتاز للكتابة من اليمين لليسار'),B('ul','قوالب جاهزة للشركات السعودية'),B('ul','عرض التاريخ الهجري بجانب الميلادي في التقويم'),B('ul','تعديل جماعي لحظي')];
  return {pages:P,current:home.id,theme:'system',ver:4};
}
function migrate(o){
  Object.values(o.pages).forEach(p=>{p.kind='page';p.comments=[];p.updated=p.created=Date.now();
    p.blocks=p.blocks.map(b=>b.type==='code'?{id:b.id,type:'code',code:b.text||''}:{id:b.id,type:b.type,html:esc(b.text||''),checked:b.checked,pageId:b.pageId})});
  o.theme='system';return o;
}

/* ---------- state ---------- */
let db=opts.db||null;
if(db&&db.pages&&Object.values(db.pages).some(p=>p.blocks&&p.blocks.some(b=>b.text!=null&&b.html==null)))db=migrate(db);
if(!db||!db.pages||!Object.keys(db.pages).length)db=seed();
const P=()=>db.pages;
const page=()=>db.pages[db.current];
const alive=p=>p&&!p.trashed;
const tt=p=>p?(p.title||'بدون عنوان'):'';
const icn=p=>p.icon||(p.kind==='db'?'🗃️':p.isRow?'':'📄');
const treeKids=pid=>Object.values(P()).filter(p=>p.parent===pid&&!p.isRow&&!p.trashed).sort((a,b)=>a.order-b.order);
const allKids=pid=>Object.values(P()).filter(p=>p.parent===pid);
function firstRoot(){return treeKids(null)[0]}
if(!alive(db.pages[db.current]))db.current=(firstRoot()||{}).id;
if((db.ver||0)<3){
  if(!Object.values(db.pages).some(p=>p.kind==='wb')){
    const home=Object.values(db.pages).find(p=>!p.parent&&!p.trashed&&p.title==='مرحباً في مداد');const pid=home?home.id:null;
    const bp=mkPage({parent:pid,order:nextOrder(pid),icon:'🎨',title:'لوحة الأفكار',kind:'wb',blocks:[],items:boardSeedItems()});
    if(home)home.blocks.push({id:uid(),type:'h2',html:'لوحة بيضاء'},{id:uid(),type:'wb',pageId:bp.id});
  }
  db.ver=3;
}
if((db.ver||0)<4){
  const proj=Object.values(db.pages).find(x=>x.kind==='db'&&!x.trashed);
  Object.values(db.pages).forEach(p=>{if(p.kind!=='wb')return;p.kind='page';p.mode='canvas';p.items=p.items||[];
    if(!p.blocks||!p.blocks.length)p.blocks=[{id:uid(),type:'p',html:''}];
    if(p.title==='لوحة الأفكار'&&!p.items.some(i=>i.type==='doc')){
      const center=p.items.find(i=>i.type==='ellipse');const d={id:uid(),type:'doc',x:-1428,y:-330,w:788};p.items.unshift(d);
      if(center)p.items.push({id:uid(),type:'arrow',from:d.id,to:center.id,color:'gray',text:'نختار من هنا'});
      if(proj){p.items.push({id:uid(),type:'card',pageId:proj.id,x:-440,y:420,w:900});const s={id:uid(),type:'sticky',x:520,y:470,w:190,h:190,color:'pink',text:'هذي المهمة لازم تخلص قبل الإطلاق!'};p.items.push(s,{id:uid(),type:'arrow',from:s.id,to:null,p1:null,p2:{x:300,y:620},color:'red',text:''})}
      if(p.blocks.length===1&&!(p.blocks[0].html||'').trim())p.blocks=boardSummaryBlocks();
      p.cam=null;
    }
    delete p.fresh;
  });
  db.ver=4;
}

const statusEl=$('#status');let saveT;
function save(){
  if(opts.readOnly){statusEl.textContent='للقراءة فقط';return}
  statusEl.textContent='يحفظ…';clearTimeout(saveT);
  saveT=setTimeout(()=>{opts.cacheLocal(db);opts.persist(db).then(()=>{statusEl.textContent='محفوظ'},err=>{statusEl.textContent='لم يُحفظ';toast('تعذّر الحفظ على الخادم: '+(err&&err.message||err),['إعادة المحاولة',save])})},400);
}
function setStatus(t){statusEl.textContent=t}
function touch(p){if(p)p.updated=Date.now()}

/* ---------- caret helpers ---------- */
function pointAt(el,off){
  const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let n=0,node,last=null;
  while((node=w.nextNode())){
    const m=node.parentElement&&node.parentElement.closest('.mention');
    if(n+node.length>=off){
      if(m&&el.contains(m)&&m!==el){const par=m.parentNode;return {node:par,offset:[...par.childNodes].indexOf(m)+1}}
      return {node,offset:off-n};
    }
    n+=node.length;last=node;
  }
  if(last){const m=last.parentElement&&last.parentElement.closest('.mention');if(m&&m!==el){const par=m.parentNode;return {node:par,offset:[...par.childNodes].indexOf(m)+1}}return {node:last,offset:last.length}}
  return {node:el,offset:el.childNodes.length};
}
function caretOffset(el){
  const s=getSelection();if(!s.rangeCount)return 0;const r=s.getRangeAt(0);
  if(!el.contains(r.endContainer))return 0;
  const pre=r.cloneRange();pre.selectNodeContents(el);pre.setEnd(r.endContainer,r.endOffset);return pre.toString().length;
}
function rangeOf(el,a,b){const r=document.createRange();const p1=pointAt(el,a),p2=pointAt(el,b);r.setStart(p1.node,p1.offset);r.setEnd(p2.node,p2.offset);return r}
function setCaret(el,off){const p=pointAt(el,off);const r=document.createRange();r.setStart(p.node,p.offset);r.collapse(true);const s=getSelection();s.removeAllRanges();s.addRange(r)}
function caretRect(){const s=getSelection();if(!s.rangeCount)return null;const r=s.getRangeAt(0).cloneRange();r.collapse(true);const rs=r.getClientRects();return rs.length?rs[0]:null}
function atEdge(el,up){
  const r=caretRect(),len=el.textContent.length,off=caretOffset(el);
  if(!r)return up?off===0:off===len;
  const b=el.getBoundingClientRect(),lh=parseFloat(getComputedStyle(el).lineHeight)||26;
  return up?(r.top-b.top<lh*.75):(b.bottom-r.bottom<lh*.75);
}

/* ---------- theme ---------- */
const hostTheme=document.documentElement.getAttribute('data-theme');
function applyTheme(){
  const t=db.theme||'system';
  if(t==='system'){if(hostTheme)document.documentElement.setAttribute('data-theme',hostTheme);else document.documentElement.removeAttribute('data-theme')}
  else document.documentElement.setAttribute('data-theme',t);
  const lbl={system:['تلقائي',IC.auto],light:['فاتح',IC.sun],dark:['داكن',IC.moon]}[t];
  $('#themeBtn').innerHTML=lbl[1]+'<span class="sp">المظهر</span><span style="font-size:12px;color:var(--faint)">'+lbl[0]+'</span>';
}
$('#themeBtn').onclick=()=>{db.theme={system:'light',light:'dark',dark:'system'}[db.theme||'system'];applyTheme();save()};

/* ---------- sidebar ---------- */
const treeEl=$('#tree');
$('#findBtn').innerHTML=IC.search+'<span class="sp">بحث</span><kbd>Ctrl K</kbd>';
$('#newPage').innerHTML=IC.plus+'<span class="sp">صفحة جديدة</span>';
$('#newBoard').innerHTML=S('<path d="M4 4h16v10l-6 6H4z"/><path d="M14 20v-6h6"/>')+'<span class="sp">لوحة بيضاء جديدة</span>';
$('#trashBtn').innerHTML=IC.trash+'<span class="sp">سلة المحذوفات</span>';
$('#collapse').innerHTML=IC.dbl;$('#openNav').innerHTML=IC.menu;$('#dataClose').innerHTML=IC.x;
function renderSide(){
  treeEl.innerHTML='';
  const favs=Object.values(P()).filter(p=>p.fav&&alive(p));
  if(favs.length){treeEl.append(h('div','sec-label','المفضلة'));favs.forEach(p=>treeEl.append(row(p,0,false)))}
  treeEl.append(h('div','sec-label','الصفحات'));
  (function b(pid,d){treeKids(pid).forEach(p=>{treeEl.append(row(p,d,true));if(p.open&&treeKids(p.id).length)b(p.id,d+1)})})(null,0);
}
let sideT;function renderSideSoon(){clearTimeout(sideT);sideT=setTimeout(renderSide,150)}
function row(p,depth,tree){
  const r=h('div','row'+(p.id===db.current?' active':''));r.style.paddingInlineStart=(2+depth*14)+'px';r.tabIndex=0;r.setAttribute('role','link');
  const has=treeKids(p.id).length>0;
  const tog=h('button','tog'+(p.open?' open':'')+(!tree||!has?' none':''));tog.innerHTML=IC.chev;tog.setAttribute('aria-label',p.open?'طي':'توسيع');tog.tabIndex=-1;
  tog.onclick=e=>{e.stopPropagation();p.open=!p.open;renderSide();save()};
  const more=h('button','rb');more.innerHTML=IC.dots;more.setAttribute('aria-label','خيارات');more.onclick=e=>{e.stopPropagation();pageMenu(p,more,false)};
  r.append(tog,h('span','ic',icn(p)),h('span','nm',tt(p)),more);
  if(p.kind==='page'){const add=h('button','rb');add.innerHTML=IC.plus;add.setAttribute('aria-label','صفحة فرعية');add.onclick=e=>{e.stopPropagation();newPage(p.id)};r.append(add)}
  r.onclick=()=>openPage(p.id);
  r.onkeydown=e=>{if(e.key==='Enter'&&e.target===r)openPage(p.id)};
  r.draggable=true;r.title='اسحب الصفحة إلى أي لوحة';r.addEventListener('dragstart',e=>{try{e.dataTransfer.setData('application/x-midad-page',p.id);e.dataTransfer.effectAllowed='copy'}catch(x){}});
  return r;
}

/* ---------- page ops ---------- */
function mkPage(o){const id=uid(),now=Date.now();const p=Object.assign({id,parent:null,order:0,icon:'',title:'',blocks:[{id:uid(),type:'p',html:''}],kind:'page',created:now,updated:now,comments:[]},o);db.pages[id]=p;return p}
function nextOrder(pid){const k=allKids(pid);return k.length?Math.max(...k.map(x=>x.order||0))+1:0}
function newPage(parent){
  const p=mkPage({parent,order:nextOrder(parent),icon:'📄'});
  if(parent){db.pages[parent].open=true;db.pages[parent].blocks.push({id:uid(),type:'page',pageId:p.id})}
  openPage(p.id,true);save();return p;
}
function newDB(parent,title){
  const d=mkPage({parent,order:nextOrder(parent),icon:'🗃️',title:title||'',kind:'db',blocks:[]});
  d.schema=[{id:'title',name:'الاسم',type:'title'},{id:uid(),name:'الحالة',type:'select',options:[{id:uid(),name:'لم يبدأ',color:'gray'},{id:uid(),name:'قيد التنفيذ',color:'blue'},{id:uid(),name:'مكتمل',color:'green'}]},{id:uid(),name:'المسؤول',type:'person'},{id:uid(),name:'التاريخ',type:'date'}];
  d.views=[{id:uid(),name:'جدول',type:'table'},{id:uid(),name:'لوحة',type:'board',groupBy:d.schema[1].id},{id:uid(),name:'تقويم',type:'calendar',dateProp:d.schema[3].id}];
  d.view=d.views[0].id;
  for(let i=0;i<3;i++)addRow(d,{});
  return d;
}
const navStack=[];
function openPage(id,focusTitle){
  if(!db.pages[id])return;
  db.current=id;let p=db.pages[id];
  while(p&&p.parent&&db.pages[p.parent]){db.pages[p.parent].open=true;p=db.pages[p.parent]}
  closeMenu();closePop();hideFmt();
  $('#app').classList.remove('nav');
  renderPage();$('#main').scrollTop=0;
  if(focusTitle){const t=$('#title');if(t)t.focus()}
  save();
}
function subtree(id){const out=[id];for(let i=0;i<out.length;i++)allKids(out[i]).forEach(k=>out.push(k.id));return out}
function trashPage(id,quiet){
  const ids=subtree(id),now=Date.now();
  ids.forEach(x=>{const p=db.pages[x];if(!p.trashed){p.trashed=now;p.trashRoot=id}});
  db.pages[id].fav=false;
  if(ids.includes(db.current)){const par=db.pages[id].parent;openPage(alive(db.pages[par])&&!db.pages[par].isRow?par:(alive(db.pages[par])?par:(firstRoot()||newRoot()).id))}
  else{renderPage()}
  save();
  if(!quiet)toast('نُقلت "'+tt(db.pages[id])+'" إلى السلة',['تراجع',()=>{restorePage(id);renderPage()}]);
  else toast('حُذف الصف',['تراجع',()=>{restorePage(id);renderPage()}]);
}
function newRoot(){return mkPage({order:nextOrder(null),icon:'📄'})}
function restorePage(id){
  subtree(id).forEach(x=>{const p=db.pages[x];if(p.trashRoot===id){delete p.trashed;delete p.trashRoot}});
  const p=db.pages[id];if(p.parent&&!alive(db.pages[p.parent])){p.parent=null;p.isRow=false}
  save();renderSide();
}
function purgePage(id){
  const ids=new Set(subtree(id));ids.forEach(x=>delete db.pages[x]);
  Object.values(P()).forEach(p=>{p.blocks=(p.blocks||[]).filter(b=>!(LINKT.includes(b.type)&&ids.has(b.pageId)))});
  save();
}
function dup(id,parent,top){
  const src=db.pages[id];const cp=JSON.parse(JSON.stringify(src));
  cp.id=uid();cp.parent=parent;cp.fav=false;cp.created=cp.updated=Date.now();cp.comments=[];
  if(top){cp.title=src.title?src.title+' (نسخة)':'';cp.order=(src.order||0)+0.01}
  cp.blocks.forEach(b=>b.id=uid());
  db.pages[cp.id]=cp;
  allKids(id).filter(k=>!k.trashed&&k.id!==cp.id).forEach(k=>{const nid=dup(k.id,cp.id,false);cp.blocks.forEach(b=>{if(LINKT.includes(b.type)&&b.pageId===k.id)b.pageId=nid})});
  return cp.id;
}

/* ---------- markdown export ---------- */
function inlineMd(html){
  const t=document.createElement('template');t.innerHTML=html||'';
  const walk=n=>{let s='';n.childNodes.forEach(c=>{
    if(c.nodeType===3){s+=c.textContent;return}if(c.nodeType!==1)return;const inner=walk(c);
    switch(c.tagName){case 'B':case 'STRONG':s+='**'+inner+'**';break;case 'I':case 'EM':s+='*'+inner+'*';break;case 'S':case 'STRIKE':s+='~~'+inner+'~~';break;case 'CODE':s+='`'+inner+'`';break;
      case 'A':s+='['+inner+']('+(c.getAttribute('href')||'')+')';break;case 'BR':s+='\n';break;
      default:if(c.classList&&c.classList.contains('mention')){const p=db.pages[c.dataset.page];s+='[['+tt(p)+']]'}else s+=inner}
  });return s};
  return walk(t.content);
}
function display(pr,v){
  if(v==null||v==='')return '';
  switch(pr.type){case 'select':{const o=(pr.options||[]).find(x=>x.id===v);return o?o.name:''}
    case 'multi':return (Array.isArray(v)?v:[]).map(id=>((pr.options||[]).find(x=>x.id===id)||{}).name).filter(Boolean).join('، ');
    case 'checkbox':return v?'✓':'';case 'date':return fmtDate(v);case 'number':return typeof v==='number'?arn(v):'';default:return String(v)}
}
function pageMd(p){
  const out=['# '+(p.icon?p.icon+' ':'')+tt(p),''];
  if(p.isRow){const d=db.pages[p.parent];if(d)d.schema.filter(s=>s.type!=='title').forEach(s=>out.push('- **'+s.name+'**: '+display(s,(p.props||{})[s.id])));out.push('')}
  if(p.kind==='db'){const rs=rowsOf(p);out.push('| '+p.schema.map(s=>s.name).join(' | ')+' |','|'+p.schema.map(()=>' --- ').join('|')+'|');rs.forEach(r=>out.push('| '+p.schema.map(s=>(s.type==='title'?tt(r):display(s,(r.props||{})[s.id])).replace(/\|/g,'\\|')).join(' | ')+' |'));return out.join('\n')}
  const cnt=[];
  p.blocks.forEach(b=>{
    const ind='  '.repeat(b.indent||0),tx=b.type==='code'?'':inlineMd(b.html);
    if(b.type==='ol'){cnt.length=(b.indent||0)+1;cnt[b.indent||0]=(cnt[b.indent||0]||0)+1}else cnt.length=b.indent||0;
    switch(b.type){case 'h1':out.push('# '+tx);break;case 'h2':out.push('## '+tx);break;case 'h3':out.push('### '+tx);break;
      case 'ul':out.push(ind+'- '+tx);break;case 'ol':out.push(ind+cnt[b.indent||0]+'. '+tx);break;case 'todo':out.push(ind+'- ['+(b.checked?'x':' ')+'] '+tx);break;
      case 'toggle':out.push(ind+'- ▸ '+tx);break;case 'quote':out.push('> '+tx);break;case 'callout':out.push('> '+(b.icon||'💡')+' '+tx);break;
      case 'code':out.push('```',b.code||'','```');break;case 'divider':out.push('---');break;case 'image':out.push('![صورة]('+(b.caption||'')+')');break;
      case 'page':case 'db':case 'wb':out.push('[['+tt(db.pages[b.pageId])+']]');break;default:out.push(ind+tx)}
  });
  const its=(p.items||[]).filter(i=>i.text&&i.type!=='doc');
  if(its.length){out.push('','## من اللوحة');its.forEach(i=>out.push((i.type==='frame'?'### ':'- ')+i.text.replace(/\n/g,' ')+(i.votes?' (👍 '+i.votes+')':'')))}
  return out.join('\n');
}

/* ---------- render page ---------- */
let blocksEl=null;
const docWrap=$('#docWrap');
const UI={comment:null};
function renderCrumbs(){
  const c=$('#crumbs');c.innerHTML='';const chain=[];let p=page();
  while(p){chain.unshift(p);p=db.pages[p.parent]}
  chain.forEach((x,i)=>{if(i)c.append(h('span','sep','/'));const b=h('button','',(icn(x)?icn(x)+' ':'')+tt(x));b.onclick=()=>openPage(x.id);c.append(b)});
}
function renderTop(){
  const p=page();
  $('#favBtn').innerHTML=p.fav?IC.starF:IC.star;$('#favBtn').classList.toggle('on',!!p.fav);
  $('#favBtn').setAttribute('aria-pressed',!!p.fav);
  $('#comBtn').innerHTML=IC.chat;$('#moreBtn').innerHTML=IC.dots;
  statusEl.textContent='عُدّلت '+rel(p.updated);
  const seg=$('#modeSeg');seg.hidden=!(p.kind==='page'||p.kind==='db');
  seg.querySelectorAll('button').forEach(b=>{const on=(p.mode==='canvas'?'canvas':'doc')===b.dataset.m;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});
}
function renderPage(focus){
  const p=page();if(!p)return;
  hideFmt();closeMenu();
  docWrap.innerHTML='';blocksEl=null;
  $('#main').classList.toggle('wbmode',isCanvas(p));
  if(isCanvas(p)){
    const dIt=ensureDocItem(p);
    const card=h('div','it it-doc'+(p.kind==='db'?' it-docdb':''));card.dir='rtl';card.dataset.id=dIt.id;
    const hd=h('div','doc-head');hd.innerHTML=IC.grip;hd.append(h('span','',p.kind==='db'?'جدول الصفحة':'مستند الصفحة'));hd.title='اسحب لتحريك المستند على اللوحة';card.append(hd);
    const body=h('div','doc-body'+(p.font&&p.font!=='sans'?' f-'+p.font:'')+(p.locked?' locked':''));
    if(p.kind==='db'){const host=h('div','dbhost');host.dataset.dbhost=p.id;renderDB(p,host,false);body.append(host)}
    else{
      if(p.isRow&&db.pages[p.parent])body.append(propsPanel(p));
      blocksEl=h('div','blocks');body.append(blocksEl);renderBlocks(p);bindDnD();
      const tail=h('div','tail');tail.onclick=()=>{const last=p.blocks[p.blocks.length-1];if(last&&last.type==='p'&&!btxt(last)&&!(last.indent)){focusBlock(last.id,0);return}const nb={id:uid(),type:'p',html:''};p.blocks.push(nb);renderPage({id:nb.id,offset:0});save()};
      body.append(tail);
    }
    card.append(body);
    WB.ov=false;renderBoardPage(p,card);renderCrumbs();renderTop();renderSide();if(!dataEl.hidden)renderData();
    if(focus)focusBlock(focus.id,focus.offset);
    return;
  }
  WB.el={};WB.p=null;WB.docEl=null;WB.ov=false;
  if(p.cover){
    const cv=h('div','cover cv-'+p.cover);const tl=h('div','cover-tools');
    const ch=h('button','','تغيير الغلاف');ch.onclick=()=>coverPicker(ch);const rm=h('button','','إزالة');rm.onclick=()=>{p.cover=null;touch(p);renderPage();save()};
    tl.append(ch,rm);cv.append(tl);docWrap.append(cv);
  }
  const doc=h('article','doc'+(p.full?' full':'')+(p.font&&p.font!=='sans'?' f-'+p.font:'')+(p.cover?' has-cover':'')+(p.locked?' locked':''));
  if(p.locked){const lb=h('div','lockbar');lb.innerHTML=IC.lock;lb.append(h('span','','الصفحة مقفلة للتعديل.'));const u=h('button','','فتح القفل');u.onclick=()=>{p.locked=false;renderPage();save()};lb.append(u);doc.append(lb)}
  const ctr=h('div','pctrl');
  if(!p.icon&&!p.locked){const a=h('button','ghost');a.innerHTML=IC.smile+'<span>إضافة أيقونة</span>';a.onclick=()=>{p.icon=ICONS[Math.floor(Math.random()*ICONS.length)];touch(p);renderPage();save()};ctr.append(a)}
  if(!p.cover&&!p.locked){const a=h('button','ghost');a.innerHTML=IC.image+'<span>إضافة غلاف</span>';a.onclick=()=>{p.cover=COVERS[Math.floor(Math.random()*COVERS.length)][0];touch(p);renderPage();save()};ctr.append(a)}
  if(!(p.comments||[]).length){const a=h('button','ghost');a.innerHTML=IC.chat+'<span>إضافة تعليق</span>';a.onclick=()=>{UI.comment=p.id;renderPage();const i=$('.cm-in');if(i)i.focus()};ctr.append(a)}
  if(p.icon){const ib=h('button','page-icon',p.icon);ib.id='pageIcon';ib.setAttribute('aria-label','تغيير الأيقونة');ib.onclick=()=>iconPicker(ib,v=>{p.icon=v;touch(p);renderPage();save()},true);doc.append(ib)}
  doc.append(ctr);
  const title=h('h1','page-title');title.id='title';title.dataset.ph='بدون عنوان';title.textContent=p.title;title.dir=dirOf(p.title);
  if(!p.locked){title.contentEditable=PCE;bindTitle(title)}
  doc.append(title);
  if(p.isRow&&db.pages[p.parent])doc.append(propsPanel(p));
  if((p.comments||[]).length||UI.comment===p.id)doc.append(commentsEl(p));
  if(p.kind==='db'){
    const host=h('div','dbhost');host.dataset.dbhost=p.id;renderDB(p,host,false);doc.append(host);
  }else{
    blocksEl=h('div','blocks');doc.append(blocksEl);renderBlocks(p);bindDnD();
    if(!p.isRow&&p.blocks.length===1&&p.blocks[0].type==='p'&&!btxt(p.blocks[0]).trim()&&!p.locked)doc.append(templatesEl(p));
    const tail=h('div','tail');tail.onclick=()=>{
      const last=p.blocks[p.blocks.length-1];
      if(last&&last.type==='p'&&!btxt(last)&&!(last.indent)){focusBlock(last.id,0);return}
      const nb={id:uid(),type:'p',html:''};p.blocks.push(nb);renderPage({id:nb.id,offset:0});save()};
    doc.append(tail);
  }
  docWrap.append(doc);
  if(p.kind==='page'&&blocksEl)renderOverlay(p,doc);
  renderCrumbs();renderTop();renderSide();
  if(!dataEl.hidden)renderData();
  if(focus)focusBlock(focus.id,focus.offset);
}
function bindTitle(t){
  t.addEventListener('input',()=>{if(t.textContent===''&&t.innerHTML!=='')t.innerHTML='';const p=page();p.title=t.textContent.replace(/\n/g,' ');t.dir=dirOf(p.title);touch(p);renderCrumbs();renderSideSoon();save()});
  t.addEventListener('keydown',e=>{
    if(e.isComposing)return;const p=page();
    if(e.key==='Enter'){e.preventDefault();if(p.kind!=='page'){t.blur();return}const nb={id:uid(),type:'p',html:''};p.blocks.unshift(nb);renderPage({id:nb.id,offset:0});save()}
    if(e.key==='ArrowDown'&&atEdge(t,false)&&blocksEl){const f=blocksEl.querySelector('.content');if(f){e.preventDefault();f.focus();setCaret(f,0)}}
  });
  t.addEventListener('paste',e=>{e.preventDefault();const s=(e.clipboardData||window.clipboardData).getData('text/plain').replace(/\s*\n\s*/g,' ');document.execCommand('insertText',false,s)});
}
function templatesEl(p){
  const w=h('div','tpl');w.append(h('div','lbl','ابدأ بقالب، أو اكتب مباشرة'));
  const B=(type,html,x)=>Object.assign({id:uid(),type,html:html||''},x||{});
  const T=[
    ['✅','قائمة مهام',()=>{if(!p.title)p.title='مهام الأسبوع';if(!p.icon)p.icon='✅';p.blocks=[B('h3','اليوم'),B('todo',''),B('h3','هذا الأسبوع'),B('todo',''),B('h3','لاحقاً'),B('todo','')]}],
    ['🗒️','ملاحظات اجتماع',()=>{if(!p.title)p.title='ملاحظات اجتماع';if(!p.icon)p.icon='🗒️';p.blocks=[B('p','التاريخ: '+fmtDate(iso(new Date())),{color:'c-gray'}),B('h2','الحضور'),B('ul',''),B('h2','جدول الأعمال'),B('ol',''),B('h2','القرارات'),B('ul',''),B('h2','المهام التالية'),B('todo','')]}],
    ['📐','مستند مشروع',()=>{if(!p.title)p.title='مستند مشروع';if(!p.icon)p.icon='📐';p.blocks=[B('callout','ملخص في جملتين: ما المشكلة، وما الحل المقترح.',{icon:'🎯'}),B('h2','الهدف'),B('p',''),B('h2','النطاق'),B('toggle','داخل النطاق',{open:true}),B('ul','',{indent:1}),B('toggle','خارج النطاق',{open:true}),B('ul','',{indent:1}),B('h2','المراحل'),B('ol',''),B('h2','المخاطر'),B('ul','')]}],
    ['🗃️','قاعدة بيانات',()=>{const d=newDB(p.id,'');p.blocks=[B('db','',{pageId:d.id})];if(!p.icon)p.icon='🗃️'}],
    ['🎨','لوحة بيضاء',()=>{p.mode='canvas';p.items=p.items||[];if(!p.icon||p.icon==='📄')p.icon='🎨'}]
  ];
  T.forEach(([i,l,fn])=>{const b=h('button');b.append(h('span','',i),h('span','',l));b.onclick=()=>{fn();touch(p);renderPage();save()};w.append(b)});
  return w;
}

/* ---------- blocks ---------- */
function renderBlocks(p){
  if(!p.blocks.length)p.blocks.push({id:uid(),type:'p',html:''});
  let hideAt=null;const cnt=[];
  p.blocks.forEach((b,i)=>{
    const ind=b.indent||0;
    if(hideAt!==null){if(ind>hideAt)return;hideAt=null}
    if(LINKT.includes(b.type)&&!alive(db.pages[b.pageId]))return;
    let num=0;
    if(b.type==='ol'){cnt.length=ind+1;cnt[ind]=(cnt[ind]||0)+1;num=cnt[ind]}else cnt.length=ind;
    blocksEl.append(renderBlock(b,num,p));
    if(b.type==='toggle'){
      if(!b.open)hideAt=ind;
      else{const nx=p.blocks[i+1];if(!nx||(nx.indent||0)<=ind){const e=h('div','tgl-empty','قائمة فارغة. اضغط لإضافة سطر');e.style.marginInlineStart=(ind*26+30)+'px';
        e.onclick=()=>{const nb={id:uid(),type:'p',html:'',indent:ind+1};p.blocks.splice(i+1,0,nb);renderPage({id:nb.id,offset:0});save()};blocksEl.append(e)}}
    }
  });
}
function olMarker(n,lvl){return lvl%3===1?(ABJAD[(n-1)%ABJAD.length]+'.'):(lvl%3===2?(['i','ii','iii','iv','v','vi','vii','viii','ix','x'][(n-1)%10]+'.'):(ar(n)+'.'))}
function renderBlock(b,num,p){
  const ind=b.indent||0;
  const r=h('div','block t-'+b.type+(b.type==='todo'&&b.checked?' done':'')+(b.color?' blk-'+b.color:''));r.dataset.id=b.id;
  if(ind)r.style.marginInlineStart=(ind*26)+'px';
  const gut=h('div','gut');
  const plus=h('button','gb plus');plus.innerHTML=IC.plus;plus.setAttribute('aria-label','إضافة سطر تحته');plus.title='إضافة سطر';
  plus.onclick=()=>{const nb={id:uid(),type:'p',html:'/',indent:ind};insertAfterGroup(b,nb);renderPage({id:nb.id,offset:1});const c=contentOf(nb.id);if(c)openMenu('type',nb,c,0)};
  const grip=h('button','gb grip');grip.innerHTML=IC.grip;grip.setAttribute('aria-label','اسحب للنقل، أو اضغط للخيارات');grip.title='اسحب للنقل • اضغط للخيارات';grip.draggable=true;
  grip.onclick=e=>{e.stopPropagation();blockMenu(b,grip)};
  grip.addEventListener('dragstart',e=>{dragId=b.id;e.dataTransfer.effectAllowed='move';try{e.dataTransfer.setData('text/plain',b.id)}catch(x){}r.classList.add('dragging')});
  grip.addEventListener('dragend',()=>{dragId=null;r.classList.remove('dragging');clearDrop()});
  gut.append(plus,grip);r.append(gut);
  const editable=!p.locked;
  switch(b.type){
    case 'divider':r.append(h('hr'));return r;
    case 'page':{const t=db.pages[b.pageId];const l=h('button','plink');l.append(h('span','',icn(t)||'📄'),h('span','nm',tt(t)));l.onclick=()=>openPage(t.id);r.append(l);return r}
    case 'db':{const t=db.pages[b.pageId];const host=h('div','dbhost');host.style.flex='1';host.style.minWidth='0';host.dataset.dbhost=t.id;host.dataset.inline='1';renderDB(t,host,true);r.append(host);return r}
    case 'wb':{const t=db.pages[b.pageId];const l=h('button','plink');l.append(h('span','',icn(t)||'🎨'),h('span','nm',tt(t)),h('span','',''));const n=(t.items||[]).filter(i=>i.type!=='doc').length;if(n)l.append(h('small','plmeta',arn(n)+' عنصر على اللوحة'));l.onclick=()=>{t.mode='canvas';openPage(t.id)};r.append(l);return r}
    case 'image':{
      if(b.src){const f=h('figure');const im=h('img');im.src=b.src;im.alt=b.caption||'صورة';const cap=h('figcaption');cap.dataset.ph='أضف وصفاً';cap.textContent=b.caption||'';
        if(editable){cap.contentEditable=PCE;cap.oninput=()=>{b.caption=cap.textContent;touch(p);save()}}f.append(im,cap);r.append(f)}
      else{const ph=h('div','imgph');ph.innerHTML=IC.image;ph.append(h('span','','أضف صورة من جهازك'));const lb=h('label','','رفع صورة');const inp=h('input');inp.type='file';inp.accept='image/*';
        inp.onchange=()=>{const f=inp.files&&inp.files[0];if(f)loadImage(f,src=>{b.src=src;touch(p);renderPage();save()})};lb.append(inp);ph.append(lb);r.append(ph)}
      return r;}
  }
  if(b.type==='ul'){const m=['•','◦','▪'][ind%3];r.append(h('span','marker',m))}
  if(b.type==='ol')r.append(h('span','marker',olMarker(num,ind)));
  if(b.type==='todo'){const ck=h('button','check');ck.innerHTML=IC.checkB;ck.setAttribute('role','checkbox');ck.setAttribute('aria-checked',!!b.checked);ck.setAttribute('aria-label','تم');
    ck.onclick=()=>{if(p.locked)return;b.checked=!b.checked;r.classList.toggle('done',b.checked);ck.setAttribute('aria-checked',b.checked);touch(p);save();if(!dataEl.hidden)renderData()};r.append(ck)}
  if(b.type==='toggle'){const a=h('button','tarrow'+(b.open?' open':''));a.innerHTML=IC.chev;a.setAttribute('aria-label',b.open?'طي':'توسيع');a.setAttribute('aria-expanded',!!b.open);
    a.onclick=()=>{b.open=!b.open;renderPage();save()};r.append(a)}
  if(b.type==='callout'){const ci=h('button','cicon',b.icon||'💡');ci.setAttribute('aria-label','تغيير أيقونة التنبيه');ci.onclick=()=>{if(!p.locked)iconPicker(ci,v=>{b.icon=v||'💡';renderPage();save()})};r.append(ci)}
  const c=h('div','content');c.dataset.ph=PH[b.type]||'';
  if(b.type==='code'){
    const bar=h('div','codebar');bar.append(h('span','','code'));const cp=h('button','','نسخ');cp.onclick=()=>copyText(b.code||'','نُسخ الكود');bar.append(cp);r.append(bar);
    c.textContent=b.code||'';c.dir='ltr';c.spellcheck=false;if(editable)c.contentEditable=PCE;
  }else{
    c.innerHTML=sanitize(b.html);fillMentions(c);c.dir=dirOf(c.textContent);if(editable)c.contentEditable='true';
  }
  c.addEventListener('input',e=>onInput(e,b,c));
  c.addEventListener('keydown',e=>onKey(e,b,c));
  c.addEventListener('paste',e=>onPaste(e,b,c));
  c.addEventListener('click',e=>{
    const m=e.target.closest('.mention');if(m){e.preventDefault();openPage(m.dataset.page);return}
    const a=e.target.closest('a[href]');if(a&&(e.ctrlKey||e.metaKey||p.locked)){e.preventDefault();const t=document.createElement('a');t.href=a.href;t.target='_blank';t.rel='noopener';t.click()}
  });
  r.append(c);return r;
}
function fillMentions(c){c.querySelectorAll('.mention').forEach(m=>{const t=db.pages[m.dataset.page];const ok=alive(t);m.textContent=ok?((icn(t)?icn(t)+' ':'')+tt(t)):'صفحة محذوفة';m.classList.toggle('gone',!ok);m.contentEditable='false'})}
function contentOf(id){return blocksEl&&blocksEl.querySelector('[data-id="'+id+'"] .content')}
function findBlock(id){const p=page();return p&&p.blocks?p.blocks.find(x=>x.id===id):null}
function focusBlock(id,off){const c=contentOf(id);if(!c)return;c.focus();setCaret(c,off==null?c.textContent.length:Math.min(off,c.textContent.length))}
function syncC(c){const r=c.closest('.block');if(!r)return;const b=findBlock(r.dataset.id);if(!b)return;if(b.type==='code')b.code=c.textContent;else b.html=c.innerHTML;touch(page());save();if(!dataEl.hidden)renderData()}
function group(p,i){const ind=p.blocks[i].indent||0;let j=i+1;while(j<p.blocks.length&&(p.blocks[j].indent||0)>ind)j++;return [i,j]}
function insertAfterGroup(b,nb){const p=page();const i=p.blocks.indexOf(b);const[,e]=group(p,i);p.blocks.splice(e,0,nb);return nb}
function insertAfter(b,nb){const p=page();p.blocks.splice(p.blocks.indexOf(b)+1,0,nb);return nb}
function loadImage(file,cb){
  const fr=new FileReader();fr.onload=()=>{const img=new Image();img.onload=()=>{const max=1400;let w=img.width,hh=img.height;if(w>max){hh=Math.round(hh*max/w);w=max}
    const cv=document.createElement('canvas');cv.width=w;cv.height=hh;const ctx=cv.getContext('2d');ctx.drawImage(img,0,0,w,hh);
    let out;try{out=cv.toDataURL('image/jpeg',.82)}catch(e){out=fr.result}cb(out)};img.onerror=()=>toast('تعذّرت قراءة الصورة');img.src=fr.result};
  fr.readAsDataURL(file);
}

/* ---------- editing ---------- */
const MD=[[/^###\s/,'h3'],[/^##\s/,'h2'],[/^#\s/,'h1'],[/^[-*•]\s/,'ul'],[/^(1|١)[.)]\s/,'ol'],[/^\[ ?\]\s/,'todo'],[/^>>\s/,'toggle'],[/^>\s/,'quote'],[/^```$/,'code'],[/^---$/,'divider']];
function onInput(e,b,c){
  const p=page();
  if(b.type==='code'){b.code=c.textContent;touch(p);save();return}
  if(c.textContent===''&&!c.querySelector('.mention,img'))c.innerHTML='';
  b.html=c.innerHTML;touch(p);
  const text=c.textContent;c.dir=dirOf(text);
  const tpl=c.closest('.doc')&&c.closest('.doc').querySelector('.tpl');if(tpl&&text)tpl.remove();
  if(menu.open&&menu.id===b.id){updateMenu();save();return}
  if(e.data==='/'||e.data==='@'){const off=caretOffset(c);const prev=text[off-2];if(off===1||/\s/.test(prev||'')){openMenu(e.data==='/'?'type':'mention',b,c,off-1);save();return}}
  if(b.type==='p'){
    for(const[re,t]of MD){const m=text.match(re);if(m){
      if(t==='divider'){b.type='divider';b.html='';const nb=insertAfter(b,{id:uid(),type:'p',html:'',indent:b.indent});renderPage({id:nb.id,offset:0})}
      else if(t==='code'){b.type='code';b.code='';delete b.html;renderPage({id:b.id,offset:0})}
      else{rangeOf(c,0,m[0].length).deleteContents();b.html=sanitize(c.innerHTML);b.type=t;if(t==='toggle')b.open=true;renderPage({id:b.id,offset:0})}
      save();return;
    }}
  }
  save();if(!dataEl.hidden)renderData();
}
function visibleContents(){return blocksEl?[...blocksEl.querySelectorAll('.content')]:[]}
function onKey(e,b,c){
  if(menu.open&&menu.id===b.id){
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(menu.items.length){menu.idx=(menu.idx+(e.key==='ArrowDown'?1:-1)+menu.items.length)%menu.items.length;drawMenu()}return}
    if(e.key==='Enter'||e.key==='Tab'){e.preventDefault();if(menu.items[menu.idx])pickMenu(menu.items[menu.idx]);else closeMenu();return}
    if(e.key==='Escape'){e.preventDefault();closeMenu();return}
  }
  if(e.isComposing)return;
  const p=page(),i=p.blocks.indexOf(b),ind=b.indent||0;
  const mod=e.ctrlKey||e.metaKey;
  if(mod&&!e.shiftKey&&(e.key==='e'||e.key==='E')&&b.type!=='code'){const s=getSelection();if(!s.isCollapsed){e.preventDefault();fmtRange=s.getRangeAt(0).cloneRange();fmtC=c;wrapCode()}return}
  if(e.key==='Tab'){
    e.preventDefault();
    if(b.type==='code'&&!e.shiftKey){document.execCommand('insertText',false,'  ');return}
    const[s,en]=group(p,i);const off=caretOffset(c);
    if(e.shiftKey){if(!ind)return;for(let k=s;k<en;k++)p.blocks[k].indent=Math.max(0,(p.blocks[k].indent||0)-1)}
    else{if(i===0)return;const prevInd=p.blocks[i-1].indent||0;if(ind>prevInd||ind>=6)return;for(let k=s;k<en;k++)p.blocks[k].indent=(p.blocks[k].indent||0)+1;
      const pv=p.blocks[i-1];if(pv.type==='toggle'&&!pv.open)pv.open=true}
    touch(p);renderPage({id:b.id,offset:off});save();return;
  }
  if(e.key==='Enter'&&b.type==='code'&&!mod)return;
  if(e.key==='Enter'&&e.shiftKey){e.preventDefault();document.execCommand('insertLineBreak');return}
  if(e.key==='Enter'){
    e.preventDefault();
    const s=getSelection();if(!s.isCollapsed)s.deleteFromDocument();
    const empty=!c.textContent&&!c.querySelector('.mention');
    if(empty&&['ul','ol','todo','toggle','quote','callout'].includes(b.type)){if(ind&&b.type!=='callout'&&b.type!=='quote'){b.indent=ind-1}else{b.type='p'}renderPage({id:b.id,offset:0});save();return}
    if(empty&&b.type==='p'&&ind){b.indent=ind-1;renderPage({id:b.id,offset:0});save();return}
    let rest='';
    if(b.type==='code'){b.code=c.textContent}
    else{const off=caretOffset(c);const rr=document.createRange();const pt=pointAt(c,off);rr.setStart(pt.node,pt.offset);rr.setEnd(c,c.childNodes.length);
      const tmp=h('div');tmp.append(rr.extractContents());rest=sanitize(tmp.innerHTML);b.html=sanitize(c.innerHTML)}
    let nt='p',nind=ind;
    if(['ul','ol','todo'].includes(b.type))nt=b.type;
    if(b.type==='toggle'){if(b.open)nind=ind+1;else nt='toggle'}
    const nb={id:uid(),type:nt,html:rest,indent:nind};if(nt==='toggle')nb.open=false;
    if(b.type==='toggle'&&!b.open)insertAfterGroup(b,nb);else insertAfter(b,nb);
    touch(p);renderPage({id:nb.id,offset:0});save();return;
  }
  if(e.key==='Backspace'){
    const s=getSelection();
    if(s.isCollapsed&&caretOffset(c)===0){
      if(b.type!=='p'){e.preventDefault();if(b.type==='code'){b.html=esc(b.code||'');delete b.code}b.type='p';b.checked=false;renderPage({id:b.id,offset:0});save();return}
      if(ind){e.preventDefault();const[st,en]=group(p,i);for(let k=st;k<en;k++)p.blocks[k].indent=Math.max(0,(p.blocks[k].indent||0)-1);renderPage({id:b.id,offset:0});save();return}
      if(i===0)return;
      e.preventDefault();
      const vis=visibleContents();const vi=vis.indexOf(c);
      const prevEl=vi>0?vis[vi-1]:null;const prevB=p.blocks[i-1];
      if(prevB&&!TEXTY(prevB.type)){
        if(prevB.type==='divider'){p.blocks.splice(i-1,1);renderPage({id:b.id,offset:0});save();return}
        if(!c.textContent){p.blocks.splice(i,1);const pe=prevEl&&prevEl.closest('.block').dataset.id;renderPage(pe?{id:pe}:null);save()}
        return;
      }
      if(!prevEl)return;
      const pb=findBlock(prevEl.closest('.block').dataset.id);if(!pb)return;
      if(pb.type==='code'){if(!c.textContent){p.blocks.splice(i,1);renderPage({id:pb.id});save()}return}
      const at=prevEl.textContent.length;pb.html=sanitize((pb.html||'')+(b.html||''));
      const kids=group(p,i);for(let k=i+1;k<kids[1];k++)p.blocks[k].indent=Math.max(pb.indent||0,(p.blocks[k].indent||0)-1);
      p.blocks.splice(i,1);touch(p);renderPage({id:pb.id,offset:at});save();return;
    }
  }
  if(e.key==='ArrowUp'||e.key==='ArrowDown'){
    const up=e.key==='ArrowUp';
    if(atEdge(c,up)){const vis=visibleContents();const vi=vis.indexOf(c);const t=vis[vi+(up?-1:1)];
      if(t){e.preventDefault();t.focus();setCaret(t,up?t.textContent.length:0)}
      else if(up){const ti=$('#title');if(ti){e.preventDefault();ti.focus();setCaret(ti,ti.textContent.length)}}}
  }
}
function onPaste(e,b,c){
  e.preventDefault();
  const t=(e.clipboardData||window.clipboardData).getData('text/plain');if(!t)return;
  const lines=t.replace(/\r/g,'').split('\n');
  if(lines.length===1||b.type==='code'){document.execCommand('insertText',false,t);return}
  const off=caretOffset(c);const rr=document.createRange();const pt=pointAt(c,off);rr.setStart(pt.node,pt.offset);rr.setEnd(c,c.childNodes.length);
  const tmp=h('div');tmp.append(rr.extractContents());const after=sanitize(tmp.innerHTML);
  c.append(document.createTextNode(lines[0]));b.html=sanitize(c.innerHTML);
  let last=b;const nt=['ul','ol','todo'].includes(b.type)?b.type:'p';
  lines.slice(1).forEach((ln,k)=>{last=insertAfter(last,{id:uid(),type:nt,html:esc(ln)+(k===lines.length-2?after:''),indent:b.indent})});
  touch(page());renderPage({id:last.id,offset:lines[lines.length-1].length});save();
}

/* ---------- drag & drop for blocks ---------- */
let dragId=null;
function clearDrop(){document.querySelectorAll('.drop-a,.drop-b').forEach(x=>x.classList.remove('drop-a','drop-b'))}
function bindDnD(){
  blocksEl.addEventListener('dragover',e=>{if(!dragId)return;const t=e.target.closest('.block');if(!t||!blocksEl.contains(t)||t.closest('.dbhost'))return;e.preventDefault();e.dataTransfer.dropEffect='move';
    const rc=t.getBoundingClientRect();const after=e.clientY>rc.top+rc.height/2;clearDrop();t.classList.add(after?'drop-a':'drop-b')});
  blocksEl.addEventListener('dragleave',e=>{if(!blocksEl.contains(e.relatedTarget))clearDrop()});
  blocksEl.addEventListener('drop',e=>{if(!dragId)return;const t=e.target.closest('.block');if(!t)return;e.preventDefault();e.stopPropagation();const after=t.classList.contains('drop-a');clearDrop();moveGroup(dragId,t.dataset.id,after);dragId=null});
}
function moveGroup(id,targetId,after){
  const p=page();if(id===targetId)return;
  const i=p.blocks.findIndex(x=>x.id===id);const[s,e]=group(p,i);const ti0=p.blocks.findIndex(x=>x.id===targetId);if(ti0>=s&&ti0<e)return;
  const g=p.blocks.splice(s,e-s);let t=p.blocks.findIndex(x=>x.id===targetId);const target=p.blocks[t];
  if(after){t=group(p,t)[1];if(target.type==='toggle'&&target.open&&group(p,p.blocks.indexOf(target))[1]>p.blocks.indexOf(target)+1){}}
  const base=g[0].indent||0,tInd=target.indent||0;g.forEach(x=>x.indent=Math.max(0,(x.indent||0)-base+tInd));
  p.blocks.splice(t,0,...g);touch(p);renderPage(TEXTY(g[0].type)?{id:g[0].id}:null);save();
}

/* ---------- slash & mention menu ---------- */
const slashEl=$('#slash');const menu={open:false,mode:'type',id:null,start:0,items:[],idx:0};
function openMenu(mode,b,c,start){menu.open=true;menu.mode=mode;menu.id=b.id;menu.start=start;menu.idx=0;updateMenu()}
function closeMenu(){menu.open=false;menu.id=null;slashEl.hidden=true}
function updateMenu(){
  const b=findBlock(menu.id);const c=b&&contentOf(b.id);if(!b||!c){closeMenu();return}
  const off=caretOffset(c);const text=c.textContent;
  if(off<=menu.start||text[menu.start]!==(menu.mode==='type'?'/':'@')){closeMenu();return}
  const q=text.slice(menu.start+1,off).trim().toLowerCase();
  if(menu.mode==='type')menu.items=TYPES.filter(t=>!q||t.label.includes(q)||t.keys.toLowerCase().includes(q)).sort((x,y)=>q?((y.label.includes(q)?1:0)-(x.label.includes(q)?1:0)):0).map(t=>({kind:'type',t}));
  else menu.items=Object.values(P()).filter(p=>alive(p)&&p.id!==db.current&&(!q||tt(p).toLowerCase().includes(q))).sort((a,b2)=>b2.updated-a.updated).slice(0,8).map(p=>({kind:'page',p}));
  if(!menu.items.length&&q.length>5){closeMenu();return}
  menu.idx=Math.min(menu.idx,Math.max(0,menu.items.length-1));
  drawMenu();slashEl.hidden=false;place(slashEl,caretRect()||c.getBoundingClientRect());
}
function drawMenu(){
  slashEl.innerHTML='';
  slashEl.append(h('div','sec',menu.mode==='type'?'أنواع البلوكات':'الإشارة إلى صفحة'));
  if(!menu.items.length){slashEl.append(h('div','meta','لا توجد نتائج'));return}
  menu.items.forEach((it,k)=>{
    const m=h('button','mi'+(k===menu.idx?' on':''));m.setAttribute('role','option');m.setAttribute('aria-selected',k===menu.idx);
    if(it.kind==='type'){const tx=h('span','tx');tx.append(h('span','',it.t.label),h('small','',it.t.hint));m.append(h('span','g',it.t.g),tx);if(it.t.k)m.append(h('kbd','',it.t.k))}
    else{const tx=h('span','tx');tx.append(h('span','',tt(it.p)));const par=db.pages[it.p.parent];if(par)tx.append(h('small','',tt(par)));m.append(h('span','gi',icn(it.p)||'📄'),tx)}
    m.onmousedown=e=>{e.preventDefault();pickMenu(it)};
    m.onmouseenter=()=>{menu.idx=k;slashEl.querySelectorAll('.mi').forEach((x,j)=>x.classList.toggle('on',j===k))};
    slashEl.append(m);
  });
  const on=slashEl.querySelector('.mi.on');if(on)on.scrollIntoView({block:'nearest'});
}
function pickMenu(it){
  const b=findBlock(menu.id);const c=b&&contentOf(b.id);if(!b||!c){closeMenu();return}
  const off=caretOffset(c),start=menu.start;closeMenu();
  rangeOf(c,start,off).deleteContents();
  if(it.kind==='page'){
    const r=rangeOf(c,start,start);const m=h('span','mention');m.dataset.page=it.p.id;m.contentEditable='false';m.textContent=(icn(it.p)?icn(it.p)+' ':'')+tt(it.p);
    const sp=document.createTextNode(' ');r.insertNode(sp);r.insertNode(m);
    const rr=document.createRange();rr.setStartAfter(sp);rr.collapse(true);const s=getSelection();s.removeAllRanges();s.addRange(rr);
    syncC(c);return;
  }
  b.html=sanitize(c.innerHTML);const t=it.t.t;const p=page();
  const empty=!htmlText(b.html).trim();
  if(t==='divider'||t==='image'){
    let tb=b;if(empty){b.type=t;b.html=''}else tb=insertAfter(b,{id:uid(),type:t,indent:b.indent});
    if(t==='divider'){const nb=insertAfter(tb,{id:uid(),type:'p',html:'',indent:b.indent});renderPage({id:nb.id,offset:0})}else renderPage();
    touch(p);save();return;
  }
  if(t==='page'){
    const np=mkPage({parent:p.id,order:nextOrder(p.id),icon:'📄'});p.open=true;
    if(empty){b.type='page';b.pageId=np.id;b.html=''}else insertAfter(b,{id:uid(),type:'page',pageId:np.id,indent:b.indent});
    openPage(np.id,true);return;
  }
  if(t==='db'){
    const d=newDB(p.id,'');p.open=true;
    if(empty){b.type='db';b.pageId=d.id;b.html=''}else insertAfter(b,{id:uid(),type:'db',pageId:d.id,indent:b.indent});
    touch(p);renderPage();save();toast('أُنشئت قاعدة بيانات بثلاث طرق عرض');return;
  }
  if(t==='wb'){
    touch(p);save();
    if(WB.p!==p||!WB.el.vp){toast('افتح الصفحة لإضافة ملاحظة');return}
    const row=c.closest('.block'),rr=row.getBoundingClientRect(),bl=blocksEl.getBoundingClientRect(),vr=WB.el.vp.getBoundingClientRect(),cc=cam();
    const wx=(bl.left-vr.left-cc.x)/cc.z,wy=(rr.top-vr.top-cc.y)/cc.z;
    const it={id:uid(),type:'sticky',x:Math.round(wx-30),y:Math.round(wy-10),w:180,h:180,color:WB.last.sticky||'yellow',text:''};
    WB.pending=JSON.stringify(WB.p.items);WB.p.items.push(it);commit();startEdit(it.id);return;
  }
  if(t==='code'){b.type='code';b.code=htmlText(b.html);delete b.html;renderPage({id:b.id,offset:start});save();return}
  b.type=t;if(t==='toggle')b.open=true;if(t==='callout'&&!b.icon)b.icon='💡';
  touch(p);renderPage({id:b.id,offset:start});save();
}

/* ---------- formatting toolbar ---------- */
const fmtEl=$('#fmt');let fmtC=null,fmtRange=null,fmtRAF=0,fmtMode='main';
function hideFmt(){fmtEl.hidden=true;fmtMode='main'}
function updateFmt(){
  if(fmtEl.contains(document.activeElement))return;
  const s=getSelection();if(!s.rangeCount||s.isCollapsed){hideFmt();return}
  const r=s.getRangeAt(0);const n=r.commonAncestorContainer;const el=n.nodeType===1?n:n.parentElement;
  const c=el&&el.closest('.content');
  if(!c||!blocksEl||!blocksEl.contains(c)||c.closest('.t-code')||page().locked||!c.isContentEditable){hideFmt();return}
  fmtC=c;fmtRange=r.cloneRange();
  if(fmtEl.hidden||fmtMode!=='main')drawFmt('main');else markFmt();
  fmtEl.hidden=false;
  const rc=r.getBoundingClientRect();const fw=fmtEl.offsetWidth,fh=fmtEl.offsetHeight;
  let top=rc.top-fh-8;if(top<56)top=rc.bottom+8;let left=rc.left+rc.width/2-fw/2;left=Math.max(8,Math.min(left,innerWidth-fw-8));
  fmtEl.style.top=top+'px';fmtEl.style.left=left+'px';
}
function fb(icon,label,fn,cls){const b=h('button','fb'+(cls?' '+cls:''));b.innerHTML=icon;b.setAttribute('aria-label',label);b.title=label;b.onmousedown=e=>e.preventDefault();b.onclick=fn;return b}
function restoreSel(){if(!fmtRange)return;const s=getSelection();s.removeAllRanges();s.addRange(fmtRange)}
function inTag(tag){const s=getSelection();if(!s.rangeCount)return null;let n=s.getRangeAt(0).commonAncestorContainer;n=n.nodeType===1?n:n.parentElement;const x=n&&n.closest(tag);return x&&fmtC&&fmtC.contains(x)?x:null}
function drawFmt(mode){
  fmtMode=mode;fmtEl.innerHTML='';
  if(mode==='main'){
    const T=document.createElement('span');T.className='fsep';
    fmtEl.append(
      fb(IC.bold,'عريض (Ctrl+B)',()=>cmd('bold')),fb(IC.italic,'مائل (Ctrl+I)',()=>cmd('italic')),fb(IC.under,'تسطير (Ctrl+U)',()=>cmd('underline')),fb(IC.strike,'يتوسطه خط',()=>cmd('strikeThrough')),
      fb(IC.code,'كود (Ctrl+E)',wrapCode),T,
      fb(IC.link,'رابط (Ctrl+K)',()=>drawFmt('link')),fb(IC.color,'اللون',()=>drawFmt('color'))
    );
    markFmt();
  }else if(mode==='link'){
    const a=inTag('a');const inp=h('input');inp.placeholder='الصق الرابط ثم Enter';inp.value=a?a.getAttribute('href'):'';
    inp.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();let u=inp.value.trim();restoreSel();if(!u){document.execCommand('unlink')}else{if(!/^(https?:|mailto:)/i.test(u))u='https://'+u;document.execCommand('createLink',false,u);fmtC.querySelectorAll('a').forEach(x=>{x.target='_blank';x.rel='noopener'})}syncC(fmtC);hideFmt()}
      if(e.key==='Escape'){e.preventDefault();restoreSel();drawFmt('main')}};
    fmtEl.append(inp);if(a)fmtEl.append(fb(IC.x,'إزالة الرابط',()=>{restoreSel();document.execCommand('unlink');syncC(fmtC);hideFmt()}));
    setTimeout(()=>inp.focus());
  }else if(mode==='color'){
    const wrap=h('div');wrap.style.cssText='display:flex;flex-direction:column;gap:2px;padding:2px';
    const r1=h('div','colors');const r2=h('div','colors');
    COLORS.slice(0,9).forEach(([k,n])=>{const b=h('button','c-'+k,'أ');b.title='نص '+n;b.setAttribute('aria-label','لون '+n);b.onmousedown=e=>e.preventDefault();b.onclick=()=>colorize('c-'+k);r1.append(b);
      const b2=h('button','bg-'+k,'أ');b2.title='خلفية '+n;b2.setAttribute('aria-label','خلفية '+n);b2.onmousedown=e=>e.preventDefault();b2.onclick=()=>colorize('bg-'+k);r2.append(b2)});
    const rm=h('button','mi small');rm.innerHTML='<span class="gi">'+IC.x+'</span><span>إزالة الألوان</span>';rm.onmousedown=e=>e.preventDefault();rm.onclick=()=>colorize(null);
    r1.style.gridTemplateColumns=r2.style.gridTemplateColumns='repeat(9,30px)';
    wrap.append(h('div','meta','لون النص'),r1,h('div','meta','لون الخلفية'),r2,rm);fmtEl.append(wrap);
  }
}
function markFmt(){if(fmtMode!=='main')return;const st=['bold','italic','underline','strikeThrough'];fmtEl.querySelectorAll('.fb').forEach((b,i)=>{if(i<4){let on=false;try{on=document.queryCommandState(st[i])}catch(e){}b.classList.toggle('on',on)}if(i===4)b.classList.toggle('on',!!inTag('code'))})}
function cmd(c){restoreSel();document.execCommand(c,false,null);syncC(fmtC);const s=getSelection();if(s.rangeCount)fmtRange=s.getRangeAt(0).cloneRange();markFmt()}
function selectNodeContents(n){const r=document.createRange();r.selectNodeContents(n);const s=getSelection();s.removeAllRanges();s.addRange(r);fmtRange=r.cloneRange()}
function wrapCode(){
  restoreSel();const s=getSelection();if(!s.rangeCount)return;const r=s.getRangeAt(0);
  const ex=inTag('code');
  if(ex){const f=ex.firstChild,l=ex.lastChild;ex.replaceWith(...ex.childNodes);if(f&&l){const rr=document.createRange();rr.setStartBefore(f);rr.setEndAfter(l);s.removeAllRanges();s.addRange(rr);fmtRange=rr.cloneRange()}}
  else{const frag=r.extractContents();frag.querySelectorAll('code').forEach(x=>x.replaceWith(...x.childNodes));const w=document.createElement('code');w.append(frag);r.insertNode(w);selectNodeContents(w)}
  syncC(fmtC);markFmt();
}
function colorize(cls){
  restoreSel();const s=getSelection();if(!s.rangeCount)return;const r=s.getRangeAt(0);
  const kind=cls?cls.split('-')[0]+'-':null;
  const frag=r.extractContents();
  frag.querySelectorAll('span').forEach(x=>{if(x.classList.contains('mention'))return;const keep=[...x.classList].filter(k=>kind?!k.startsWith(kind):false);if(keep.length)x.className=keep.join(' ');else x.replaceWith(...x.childNodes)});
  const w=document.createElement('span');if(cls)w.className=cls;w.append(frag);r.insertNode(w);
  if(cls)selectNodeContents(w);else{const f=w.firstChild,l=w.lastChild;w.replaceWith(...w.childNodes);if(f&&l){const rr=document.createRange();rr.setStartBefore(f);rr.setEndAfter(l);s.removeAllRanges();s.addRange(rr);fmtRange=rr.cloneRange()}}
  fmtC.innerHTML=sanitize(fmtC.innerHTML);fillMentions(fmtC);syncC(fmtC);hideFmt();
}
document.addEventListener('selectionchange',()=>{cancelAnimationFrame(fmtRAF);fmtRAF=requestAnimationFrame(updateFmt)});

/* ---------- popovers ---------- */
const popEl=$('#pop');let popClose=null,popAnchor=null;
function place(el,rc){
  const w=el.offsetWidth,ht=el.offsetHeight,vw=innerWidth,vh=innerHeight;
  let left=rc.right-w;left=Math.max(8,Math.min(left,vw-w-8));
  let top=rc.bottom+6;if(top+ht>vh-8)top=Math.max(8,rc.top-ht-6);
  el.style.left=left+'px';el.style.top=top+'px';
}
function openPop(anchor,build,opt){
  closePop();popEl.innerHTML='';popEl.style.width=(opt&&opt.width)||'';build(popEl);popEl.hidden=false;popAnchor=anchor;popClose=(opt&&opt.onClose)||null;
  place(popEl,anchor.getBoundingClientRect());
  const f=popEl.querySelector('input,button');if(f&&!(opt&&opt.noFocus))f.focus({preventScroll:true});
}
function closePop(){if(popEl.hidden)return;popEl.hidden=true;const f=popClose;popClose=null;popAnchor=null;if(f)f()}
function mi(label,icon,fn,cls,extra){const b=h('button','mi'+(cls?' '+cls:''));b.innerHTML='<span class="gi">'+(icon||'')+'</span>';b.append(h('span','tx',label));if(extra)b.append(extra);b.onclick=fn;return b}
function confirmMi(label,icon,fn){const b=mi(label,icon,()=>{if(!b.classList.contains('armed')){b.classList.add('armed');b.querySelector('.tx').textContent='اضغط مرة ثانية للتأكيد';return}closePop();fn()},'danger');return b}
document.addEventListener('mousedown',e=>{
  if(!popEl.hidden&&!popEl.contains(e.target)&&!(popAnchor&&popAnchor.contains(e.target)))closePop();
  if(menu.open&&!slashEl.contains(e.target))closeMenu();
  if(!fmtEl.hidden&&!fmtEl.contains(e.target)&&!e.target.closest('.content'))hideFmt();
});
function iconPicker(anchor,fn,removable){
  openPop(anchor,el=>{
    const top=h('div');top.style.cssText='display:flex;justify-content:space-between;align-items:center';top.append(h('div','sec','اختر أيقونة'));
    if(removable){const rm=h('button','tb','إزالة');rm.onclick=()=>{closePop();fn('')};top.append(rm)}
    el.append(top);const g=h('div','icons');ICONS.forEach(ic=>{const b=h('button','',ic);b.setAttribute('aria-label',ic);b.onclick=()=>{closePop();fn(ic)};g.append(b)});el.append(g);
  },{width:'320px'});
}
function coverPicker(anchor){
  const p=page();
  openPop(anchor,el=>{el.append(h('div','sec','الأغلفة'));const g=h('div','covers');COVERS.forEach(([k,n])=>{const b=h('button','cv-'+k);b.append(h('span','',n));b.setAttribute('aria-label',n);b.onclick=()=>{p.cover=k;touch(p);closePop();renderPage();save()};g.append(b)});el.append(g)},{width:'300px'});
}
function blockMenu(b,anchor){
  const p=page();if(p.locked)return;
  openPop(anchor,el=>{
    const i=()=>p.blocks.indexOf(b);
    el.append(
      confirmMi('حذف',IC.trash,()=>{const[s,e]=group(p,i());const cnt=e-s;p.blocks.splice(s,b.type==='toggle'&&!b.open?cnt:1);touch(p);renderPage();save()}),
      mi('تكرار',IC.dup,()=>{closePop();const nb=JSON.parse(JSON.stringify(b));nb.id=uid();if(LINKT.includes(nb.type)){nb.pageId=dup(b.pageId,p.id,true)}insertAfterGroup(b,nb);touch(p);renderPage(TEXTY(nb.type)?{id:nb.id}:null);save()}),
      mi('إرسال إلى اللوحة',TI.sticky,()=>{closePop();sendToCanvas(b)}),
      mi('نقل لأعلى',IC.up,()=>{closePop();const k=i();if(k===0)return;const prev=p.blocks.slice(0,k).reverse().find(x=>(x.indent||0)<=(b.indent||0));if(prev)moveGroup(b.id,prev.id,false)}),
      mi('نقل لأسفل',IC.down,()=>{closePop();const[,e]=group(p,i());const nx=p.blocks[e];if(nx)moveGroup(b.id,nx.id,true)})
    );
    if(TEXTY(b.type)){
      el.append(h('hr'),h('div','sec','تحويل إلى'));
      TYPES.filter(t=>TEXTY(t.t)&&t.t!==b.type).forEach(t=>{const it=mi(t.label,'<span style="font-family:var(--f-display);font-size:12px">'+esc(t.g)+'</span>',()=>{closePop();
        if(t.t==='code'){b.code=btxt(b);delete b.html}else if(b.type==='code'){b.html=esc(b.code||'');delete b.code}
        b.type=t.t;if(t.t!=='todo')b.checked=false;if(t.t==='toggle')b.open=true;if(t.t==='callout'&&!b.icon)b.icon='💡';touch(p);renderPage({id:b.id});save()});el.append(it)});
      el.append(h('hr'),h('div','sec','لون السطر'));
      const g=h('div','colors');g.style.gridTemplateColumns='repeat(5,1fr)';
      const none=h('button','','أ');none.title='افتراضي';none.onclick=()=>{b.color='';closePop();renderPage();save()};g.append(none);
      COLORS.forEach(([k,n])=>{const x=h('button','c-'+k,'أ');x.title='نص '+n;x.setAttribute('aria-label','نص '+n);x.onclick=()=>{b.color='c-'+k;closePop();renderPage();save()};g.append(x)});
      el.append(g);
      const g2=h('div','colors');g2.style.gridTemplateColumns='repeat(5,1fr)';
      COLORS.forEach(([k,n])=>{const x=h('button','bg-'+k,'أ');x.title='خلفية '+n;x.setAttribute('aria-label','خلفية '+n);x.onclick=()=>{b.color='bg-'+k;closePop();renderPage();save()};g2.append(x)});
      el.append(g2);
    }
  });
}
function pageMenu(p,anchor,full){
  openPop(anchor,el=>{
    el.append(mi(p.fav?'إزالة من المفضلة':'إضافة للمفضلة',p.fav?IC.starF:IC.star,()=>{p.fav=!p.fav;closePop();renderSide();renderTop();save()}));
    el.append(mi('تكرار الصفحة',IC.dup,()=>{closePop();const nid=dup(p.id,p.parent,true);const par=db.pages[p.parent];if(par&&!p.isRow){const lb=par.blocks.find(b=>LINKT.includes(b.type)&&b.pageId===p.id);if(lb)par.blocks.splice(par.blocks.indexOf(lb)+1,0,{id:uid(),type:lb.type,pageId:nid,indent:lb.indent})}openPage(nid);toast('أُنشئت نسخة من الصفحة')}));
    el.append(mi('نسخ كنص Markdown',IC.copy,()=>{closePop();copyText(pageMd(p),'نُسخت الصفحة كنص Markdown',true)}));
    if(full&&p.kind==='page'){
      el.append(h('hr'),h('div','sec','نمط الخط'));
      const fr=h('div','fontrow');[['sans','افتراضي','var(--f-body)'],['serif','نسخ','var(--f-serif)'],['mono','أحادي','var(--f-mono)']].forEach(([k,n,f])=>{const b=h('button',(p.font||'sans')===k?'on':'');const bb=h('b','','أب');bb.style.fontFamily=f;b.append(bb,h('span','',n));b.onclick=()=>{p.font=k;closePop();renderPage();save()};fr.append(b)});
      el.append(fr);
      el.append(mi('عرض كامل',IC.width,()=>{p.full=!p.full;closePop();renderPage();save()},'',p.full?h('span','ok','✓'):null));
      el.append(mi(p.locked?'فتح قفل الصفحة':'قفل الصفحة',IC.lock,()=>{p.locked=!p.locked;closePop();renderPage();save()},'',p.locked?h('span','ok','✓'):null));
      el.append(mi('بنية البيانات',IC.data,()=>{closePop();toggleData(true)}));
      el.append(mi('اختصارات لوحة المفاتيح',IC.keys,()=>{closePop();keysPop(anchor)}));
    }
    el.append(h('hr'),confirmMi('نقل إلى السلة',IC.trash,()=>trashPage(p.id)));
    const words=(p.kind!=='page'?0:p.blocks.reduce((a,b)=>a+(btxt(b).trim().split(/\s+/).filter(Boolean).length),0));
    const meta=h('div','meta');meta.textContent=(p.kind==='db'?'عدد الصفوف: '+arn(rowsOf(p).length):'عدد الكلمات: '+arn(words))+' • آخر تعديل '+rel(p.updated);el.append(meta);
  },{width:'260px'});
}
function keysPop(anchor){
  openPop(anchor,el=>{el.append(h('div','sec','اختصارات لوحة المفاتيح'));const k=h('div','keys');
    [['Ctrl K','بحث سريع، أو رابط للنص المحدد'],['/','قائمة أنواع البلوكات'],['@','الإشارة إلى صفحة'],['Tab','إزاحة السطر للداخل'],['Shift Tab','إزاحة للخارج'],['Shift Enter','سطر جديد داخل نفس البلوك'],['Ctrl B / I / U','عريض، مائل، تسطير'],['Ctrl E','كود داخل السطر'],['Ctrl \\','إظهار وإخفاء القائمة'],['# ## ###','عناوين'],['- 1. []','قوائم ومهام'],['> >>','اقتباس، قائمة قابلة للطي'],['``` ---','كود، فاصل']]
    .forEach(([a,b])=>{k.append(h('kbd','',a),h('span','',b))});el.append(k)},{width:'340px',noFocus:true});
}
function copyText(t,msg,fallback){
  try{navigator.clipboard.writeText(t).then(()=>toast(msg),()=>{if(fallback)showText(t);else toast('تعذّر النسخ')})}catch(e){if(fallback)showText(t);else toast('تعذّر النسخ')}
}
function showText(t){const m=$('#txtModal');m.hidden=false;const a=$('#txtArea');a.value=t;a.focus();a.select()}
$('#txtClose').onclick=()=>{$('#txtModal').hidden=true};
$('#txtModal').addEventListener('mousedown',e=>{if(e.target.id==='txtModal')$('#txtModal').hidden=true});

/* ---------- comments ---------- */
function commentsEl(p){
  const box=h('div','comments');box.id='comments';
  (p.comments||[]).forEach(c=>{const r=h('div','cm');r.append(h('span','av','أ'));const b=h('div','cm-b');const m=h('div','cm-m');m.append(h('b','','أنت'),document.createTextNode(rel(c.at)));
    const t=h('div','',c.text);t.dir=dirOf(c.text);b.append(m,t);const x=h('button','ib');x.innerHTML=IC.x;x.setAttribute('aria-label','حذف التعليق');x.onclick=()=>{p.comments=p.comments.filter(y=>y!==c);save();box.replaceWith(commentsEl(p))};
    r.append(b,x);box.append(r)});
  const r=h('div','cm');r.append(h('span','av','أ'));const inp=h('input','cm-in');inp.placeholder='أضف تعليقاً واضغط Enter';inp.id='cm-'+p.id;
  inp.onkeydown=e=>{if(e.key==='Enter'&&inp.value.trim()&&!e.isComposing){p.comments=p.comments||[];p.comments.push({id:uid(),text:inp.value.trim(),at:Date.now()});save();const n=commentsEl(p);box.replaceWith(n);const ni=n.querySelector('.cm-in');if(ni)ni.focus()}
    if(e.key==='Escape'&&!p.comments.length){UI.comment=null;box.remove()}};
  r.append(inp);box.append(r);return box;
}
$('#comBtn').onclick=()=>{const p=page();UI.comment=p.id;if(!$('#comments'))renderPage();const i=$('.cm-in');if(i){i.focus();i.scrollIntoView({block:'center'})}};
$('#favBtn').onclick=()=>{const p=page();p.fav=!p.fav;renderTop();renderSide();save();toast(p.fav?'أُضيفت للمفضلة':'أُزيلت من المفضلة')};
$('#moreBtn').onclick=()=>pageMenu(page(),$('#moreBtn'),true);
$('#modeSeg').onclick=e=>{const b=e.target.closest('button');if(!b)return;const p=page();const m=b.dataset.m==='canvas'?'canvas':'doc';if((p.mode||'doc')===m)return;p.mode=m;if(m==='canvas')ensureDocItem(p);save();renderPage();$('#main').scrollTop=0};

/* ---------- databases ---------- */
function rowsOf(d){return Object.values(P()).filter(p=>p.parent===d.id&&p.isRow&&!p.trashed).sort((a,b)=>a.order-b.order)}
function propOf(d,id){return d.schema.find(s=>s.id===id)}
function val(r,pr){return pr.type==='title'?r.title:(r.props||{})[pr.id]}
function setVal(r,pr,v){if(pr.type==='title')r.title=v;else{r.props=r.props||{};r.props[pr.id]=v}touch(r);touch(db.pages[r.parent]);save()}
function addRow(d,init){const r=mkPage({parent:d.id,isRow:true,order:nextOrder(d.id),icon:'',props:Object.assign({},init||{})});return r}
function curView(d){let v=d.views.find(x=>x.id===d.view);if(!v){v=d.views[0];d.view=v.id}return v}
function cmpVals(pr,a,b){
  const e1=a==null||a==='',e2=b==null||b==='';if(e1&&e2)return 0;if(e1)return 1;if(e2)return -1;
  if(pr.type==='number')return a-b;if(pr.type==='checkbox')return (a?1:0)-(b?1:0);
  if(pr.type==='select'){const o=pr.options||[];return o.findIndex(x=>x.id===a)-o.findIndex(x=>x.id===b)}
  return display(pr,a).localeCompare(display(pr,b),'ar');
}
function viewRows(d,v){
  let rs=rowsOf(d);const q=(v.q||'').trim().toLowerCase();
  if(q)rs=rs.filter(r=>d.schema.some(pr=>(pr.type==='title'?tt(r):display(pr,val(r,pr))).toLowerCase().includes(q)));
  if(v.sort){const pr=propOf(d,v.sort.prop);if(pr)rs.sort((a,b)=>{const c=pr.type==='title'?tt(a).localeCompare(tt(b),'ar'):cmpVals(pr,val(a,pr),val(b,pr));return v.sort.dir==='desc'?-c:c})}
  return rs;
}
function pill(o){const s=h('span','opt',o.name);s.style.setProperty('--k','var(--k-'+(o.color||'gray')+')');return s}
function refreshDB(id){
  document.querySelectorAll('[data-dbhost="'+id+'"]').forEach(hst=>{if(db.pages[id])renderDB(db.pages[id],hst,hst.dataset.inline==='1')});
  const cur=page();const ph=$('#propsHost');if(ph&&cur.isRow&&cur.parent===id)ph.replaceWith(propsPanel(cur));
}
function renderDB(d,host,inline){
  host.innerHTML='';const w=h('div','dbw');
  if(inline){const t=h('button','dbtitle');t.append(h('span','',icn(d)),h('span','',tt(d)));t.onclick=()=>openPage(d.id);w.append(t)}
  const v=curView(d);
  const bar=h('div','dbbar');const tabs=h('div','tabs');
  d.views.forEach(x=>{const vt=VTYPES.find(z=>z[0]===x.type)||VTYPES[0];const b=h('button','vtab'+(x.id===v.id?' on':''));b.innerHTML=IC[vt[2]];b.append(h('span','',x.name));
    b.onclick=()=>{if(x.id===v.id){viewMenu(d,x,b);return}d.view=x.id;save();refreshDB(d.id)};tabs.append(b)});
  const addV=h('button','vtab');addV.innerHTML=IC.plus;addV.setAttribute('aria-label','إضافة طريقة عرض');addV.onclick=()=>addViewMenu(d,addV);tabs.append(addV);
  const tools=h('div','dbtools');
  const sr=h('label','dsearch');sr.innerHTML=IC.search;const si=h('input');si.placeholder='بحث';si.value=v.q||'';si.setAttribute('aria-label','بحث في قاعدة البيانات');sr.append(si);
  const body=h('div','dbbody');
  si.oninput=()=>{v.q=si.value;renderBody(d,v,body)};
  const so=h('button','tb'+(v.sort?' act':''));so.innerHTML=IC.sort;const sp=v.sort&&propOf(d,v.sort.prop);so.append(h('span','',sp?sp.name+(v.sort.dir==='desc'?' ↓':' ↑'):'ترتيب'));so.onclick=()=>sortMenu(d,v,so);
  const nb=h('button','tb newbtn');nb.innerHTML=IC.plus;nb.append(h('span','','جديد'));
  nb.onclick=()=>{const r=addRow(d,{});save();if(v.type==='table'){refreshDB(d.id);const t=host.querySelector('[data-row="'+r.id+'"] .ttl');if(t)t.focus()}else openPage(r.id,true)};
  tools.append(sr,so,nb);bar.append(tabs,tools);w.append(bar,body);host.append(w);
  renderBody(d,v,body);
}
function renderBody(d,v,body){
  body.innerHTML='';const rs=viewRows(d,v);
  ({table:tableView,board:boardView,calendar:calView,list:listView,gallery:galView}[v.type]||tableView)(d,v,rs,body);
}
function glyph(pr){return '<span class="pg">'+esc(PG[pr.type]||'≡')+'</span>'}
function tableView(d,v,rs,el){
  const sc=h('div','tsc');const t=h('table','dt');const th=h('thead');const hr=h('tr');
  d.schema.forEach(pr=>{const c=h('th','th-'+pr.type);const b=h('button','thb');b.dataset.prop=pr.id;b.innerHTML=glyph(pr);b.append(h('span','pn',pr.name));b.onclick=()=>propMenu(d,pr,b);c.append(b);hr.append(c)});
  const ac=h('th','th-add');const ab=h('button','thb');ab.innerHTML=IC.plus;ab.setAttribute('aria-label','إضافة خاصية');ab.onclick=()=>addProp(d);ac.append(ab);hr.append(ac);
  th.append(hr);t.append(th);
  const tb=h('tbody');
  rs.forEach(r=>{const tr=h('tr');d.schema.forEach(pr=>{const td=h('td','td-'+pr.type);td.append(editor(d,r,pr,'table'));tr.append(td)});
    const x=h('td','td-x');const del=h('button','rowdel');del.innerHTML=IC.trash;del.setAttribute('aria-label','حذف الصف');del.onclick=()=>trashPage(r.id,true);x.append(del);tr.append(x);tb.append(tr)});
  t.append(tb);sc.append(t);el.append(sc);
  const add=h('button','dbadd');add.innerHTML=IC.plus;add.append(h('span','','صف جديد'));
  add.onclick=()=>{const r=addRow(d,{});save();refreshDB(d.id);const ti=document.querySelector('[data-row="'+r.id+'"] .ttl');if(ti)ti.focus()};
  el.append(add,h('div','dbcount','العدد: '+arn(rs.length)));
}
function editor(d,r,pr,mode){
  const v=val(r,pr);
  switch(pr.type){
    case 'title':{const w=h('div','tcell');w.dataset.row=r.id;const s=h('span','ttl');s.contentEditable=PCE;s.textContent=r.title;s.dataset.ph='بدون عنوان';s.dir=dirOf(r.title);
      s.oninput=()=>{r.title=s.textContent.replace(/\n/g,' ');s.dir=dirOf(r.title);touch(r);save()};
      s.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();s.blur()}};
      s.onpaste=e=>{e.preventDefault();document.execCommand('insertText',false,(e.clipboardData||window.clipboardData).getData('text/plain').replace(/\s*\n\s*/g,' '))};
      const o=h('button','open');o.innerHTML=IC.open;o.append(h('span','','فتح'));o.onclick=()=>openPage(r.id);w.append(s,o);return w}
    case 'text':case 'person':case 'url':case 'number':{
      const i=h('input','cin');i.type='text';i.value=v==null?'':String(v);i.placeholder=mode==='page'?'فارغ':'';i.setAttribute('aria-label',pr.name);
      if(pr.type==='number'){i.inputMode='decimal';i.dir='ltr';i.style.textAlign='right'}else i.dir=pr.type==='url'?'ltr':dirOf(i.value);
      i.oninput=()=>{let x=i.value;if(pr.type==='number'){x=x.replace(/[٠-٩]/g,c=>'٠١٢٣٤٥٦٧٨٩'.indexOf(c)).replace('٫','.');x=x.trim()===''?'':Number(x);if(x!==''&&Number.isNaN(x))return}else if(pr.type!=='url')i.dir=dirOf(x);setVal(r,pr,x);if(go)go.hidden=!/^https?:\/\//.test(i.value)};
      let go=null;
      if(pr.type==='url'){const w=h('div','urlc');go=h('a');go.innerHTML=IC.open;go.target='_blank';go.rel='noopener';go.setAttribute('aria-label','فتح الرابط');go.hidden=!/^https?:\/\//.test(i.value);
        i.addEventListener('input',()=>{go.href=i.value});go.href=i.value||'#';w.append(i,go);return w}
      return i}
    case 'date':{const i=h('input','cin');i.type='date';i.value=v||'';i.setAttribute('aria-label',pr.name);i.onchange=()=>{setVal(r,pr,i.value)};return i}
    case 'checkbox':{const w=h('div','ckwrap');const b=h('button','check'+(v?' on':''));b.innerHTML=IC.checkB;b.setAttribute('role','checkbox');b.setAttribute('aria-checked',!!v);b.setAttribute('aria-label',pr.name);
      b.onclick=()=>{const nv=!val(r,pr);setVal(r,pr,nv);b.classList.toggle('on',nv);b.setAttribute('aria-checked',nv)};w.append(b);return w}
    case 'select':case 'multi':{const b=h('button','selcell');fillSel(b,pr,v,mode);b.onclick=()=>optionPicker(d,r,pr,b,mode);return b}
  }
  return h('span');
}
function fillSel(b,pr,v,mode){
  b.innerHTML='';const ids=pr.type==='multi'?(Array.isArray(v)?v:[]):(v?[v]:[]);
  const os=ids.map(id=>(pr.options||[]).find(o=>o.id===id)).filter(Boolean);
  if(!os.length){if(mode==='page')b.append(h('span','empty','فارغ'))}else os.forEach(o=>b.append(pill(o)));
}
function optionPicker(d,r,pr,btn,mode){
  let changed=false;
  openPop(btn,el=>{
    const inp=h('input','pin');inp.placeholder='ابحث أو أنشئ خياراً';const list=h('div');
    const cur=()=>val(r,pr);
    const isOn=id=>pr.type==='multi'?(cur()||[]).includes(id):cur()===id;
    const pick=o=>{changed=true;if(pr.type==='multi'){const a=[...(cur()||[])];const k=a.indexOf(o.id);if(k>=0)a.splice(k,1);else a.push(o.id);setVal(r,pr,a);fillSel(btn,pr,a,mode);inp.value='';draw()}else{setVal(r,pr,isOn(o.id)?null:o.id);closePop()}};
    const create=()=>{const q=inp.value.trim();if(!q)return;const used=(pr.options||[]).map(o=>o.color);const col=(COLORS.find(c=>!used.includes(c[0]))||COLORS[(pr.options||[]).length%COLORS.length])[0];
      const o={id:uid(),name:q,color:col};pr.options=pr.options||[];pr.options.push(o);pick(o)};
    function draw(){
      list.innerHTML='';const q=inp.value.trim();
      list.append(h('div','sec',pr.type==='multi'?'اختر خياراً أو أكثر':'اختر خياراً'));
      (pr.options||[]).filter(o=>!q||o.name.includes(q)).forEach(o=>{
        const rw=h('div','orow');const b=h('button','mi');b.append(pill(o));const sp=h('span','tx');b.append(sp);if(isOn(o.id))b.append(h('span','ok','✓'));b.onclick=()=>pick(o);
        const x=h('button','ox');x.innerHTML=IC.x;x.setAttribute('aria-label','حذف الخيار '+o.name);x.title='حذف الخيار';
        x.onclick=()=>{changed=true;pr.options=pr.options.filter(y=>y!==o);rowsOf(d).forEach(rr=>{const vv=(rr.props||{})[pr.id];if(pr.type==='multi'&&Array.isArray(vv))rr.props[pr.id]=vv.filter(z=>z!==o.id);else if(vv===o.id)rr.props[pr.id]=null});fillSel(btn,pr,val(r,pr),mode);save();draw()};
        rw.append(b,x);list.append(rw)});
      if(q&&!(pr.options||[]).some(o=>o.name===q)){const c=h('button','mi');c.append(h('span','tx','إنشاء'));c.append(pill({name:q,color:'gray'}));c.onclick=create;list.append(c)}
    }
    inp.oninput=draw;inp.onkeydown=e=>{if(e.key==='Enter'&&!e.isComposing){e.preventDefault();const q=inp.value.trim();if(!q)return;const ex=(pr.options||[]).find(o=>o.name===q);if(ex)pick(ex);else create()}};
    el.append(inp,list);draw();
  },{onClose:()=>{if(changed)refreshDB(d.id)}});
}
function propMenu(d,pr,anchor){
  let changed=false;
  openPop(anchor,el=>{
    const n=h('input','pin');n.value=pr.name;n.setAttribute('aria-label','اسم الخاصية');n.oninput=()=>{pr.name=n.value||'بدون اسم';changed=true;save()};n.onkeydown=e=>{if(e.key==='Enter')closePop()};el.append(n);
    if(pr.type!=='title'){
      el.append(h('div','sec','النوع'));
      PTYPES.forEach(([t,l,g])=>{el.append(mi(l,esc(g),()=>{if(pr.type!==t){pr.type=t;if((t==='select'||t==='multi')&&!pr.options)pr.options=[];convertVals(d,pr);changed=true;save()}closePop()},'',pr.type===t?h('span','ok','✓'):null))});
    }
    const v=curView(d);
    el.append(h('hr'),mi('ترتيب تصاعدي',IC.up,()=>{v.sort={prop:pr.id,dir:'asc'};changed=true;save();closePop()}),mi('ترتيب تنازلي',IC.down,()=>{v.sort={prop:pr.id,dir:'desc'};changed=true;save();closePop()}));
    if(pr.type!=='title')el.append(h('hr'),confirmMi('حذف الخاصية',IC.trash,()=>{d.schema=d.schema.filter(x=>x!==pr);rowsOf(d).forEach(r=>{if(r.props)delete r.props[pr.id]});d.views.forEach(x=>{if(x.sort&&x.sort.prop===pr.id)x.sort=null;if(x.groupBy===pr.id)x.groupBy=null;if(x.dateProp===pr.id)x.dateProp=null});save();refreshDB(d.id)}));
    setTimeout(()=>{n.focus();n.select()});
  },{onClose:()=>{if(changed)refreshDB(d.id)},noFocus:true});
}
function convertVals(d,pr){
  rowsOf(d).forEach(r=>{r.props=r.props||{};const v=r.props[pr.id];let nv=v;
    switch(pr.type){case 'multi':nv=Array.isArray(v)?v:(v&&(pr.options||[]).some(o=>o.id===v)?[v]:[]);break;case 'select':nv=Array.isArray(v)?(v[0]||null):((pr.options||[]).some(o=>o.id===v)?v:null);break;
      case 'number':nv=typeof v==='number'?v:(v!==''&&v!=null&&!isNaN(Number(v))?Number(v):'');break;case 'checkbox':nv=v===true;break;
      case 'date':nv=typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)?v:'';break;default:nv=(typeof v==='string'||typeof v==='number')?String(v):''}
    r.props[pr.id]=nv});
}
function addProp(d,anchorSel){
  const pr={id:uid(),name:'خاصية جديدة',type:'text'};d.schema.push(pr);save();refreshDB(d.id);
  const b=document.querySelector('[data-dbhost="'+d.id+'"] .thb[data-prop="'+pr.id+'"]')||document.querySelector('.plabel[data-prop="'+pr.id+'"]');
  if(b){b.scrollIntoView({block:'nearest',inline:'nearest'});propMenu(d,pr,b)}else toast('أُضيفت خاصية جديدة، تظهر في عرض الجدول');
}
function sortMenu(d,v,anchor){
  openPop(anchor,el=>{el.append(h('div','sec','ترتيب حسب'));
    d.schema.forEach(pr=>{const on=v.sort&&v.sort.prop===pr.id;el.append(mi(pr.name,esc(PG[pr.type]),()=>{v.sort=on?{prop:pr.id,dir:v.sort.dir==='asc'?'desc':'asc'}:{prop:pr.id,dir:'asc'};save();closePop();refreshDB(d.id)},'',on?h('span','ok',v.sort.dir==='asc'?'↑':'↓'):null))});
    if(v.sort)el.append(h('hr'),mi('إلغاء الترتيب',IC.x,()=>{v.sort=null;save();closePop();refreshDB(d.id)}));
  });
}
function addViewMenu(d,anchor){
  openPop(anchor,el=>{el.append(h('div','sec','طريقة عرض جديدة'));
    VTYPES.forEach(([t,l,ic])=>el.append(mi(l,IC[ic],()=>{const nv={id:uid(),name:l,type:t};const sel=d.schema.find(s=>s.type==='select');const dt=d.schema.find(s=>s.type==='date');if(sel)nv.groupBy=sel.id;if(dt)nv.dateProp=dt.id;d.views.push(nv);d.view=nv.id;save();closePop();refreshDB(d.id)})))});
}
function viewMenu(d,v,anchor){
  openPop(anchor,el=>{
    const n=h('input','pin');n.value=v.name;n.setAttribute('aria-label','اسم طريقة العرض');n.oninput=()=>{v.name=n.value||'عرض';save()};n.onkeydown=e=>{if(e.key==='Enter')closePop()};el.append(n);
    el.append(h('div','sec','النوع'));
    VTYPES.forEach(([t,l,ic])=>el.append(mi(l,IC[ic],()=>{v.type=t;save();closePop()},'',v.type===t?h('span','ok','✓'):null)));
    if(v.type==='board'){el.append(h('hr'),h('div','sec','تجميع حسب'));d.schema.filter(s=>s.type==='select').forEach(s=>el.append(mi(s.name,'◉',()=>{v.groupBy=s.id;save();closePop()},'',v.groupBy===s.id?h('span','ok','✓'):null)))}
    if(v.type==='calendar'){el.append(h('hr'),h('div','sec','التاريخ المعتمد'));d.schema.filter(s=>s.type==='date').forEach(s=>el.append(mi(s.name,'▦',()=>{v.dateProp=s.id;save();closePop()},'',v.dateProp===s.id?h('span','ok','✓'):null)))}
    if(d.views.length>1)el.append(h('hr'),confirmMi('حذف طريقة العرض',IC.trash,()=>{d.views=d.views.filter(x=>x!==v);d.view=d.views[0].id;save();refreshDB(d.id)}));
  },{onClose:()=>refreshDB(d.id),noFocus:true});
}
function chipsFor(d,r,skip){
  const w=h('div','chips');
  d.schema.forEach(pr=>{if(pr.type==='title'||skip.includes(pr.id))return;const v=val(r,pr);if(v==null||v===''||(Array.isArray(v)&&!v.length)||v===false)return;
    if(pr.type==='select'){const o=(pr.options||[]).find(x=>x.id===v);if(o)w.append(pill(o))}
    else if(pr.type==='multi')(pr.options||[]).filter(o=>v.includes(o.id)).forEach(o=>w.append(pill(o)));
    else if(pr.type==='date')w.append(h('span','mut','▦ '+fmtDate(v)));
    else if(pr.type==='checkbox')w.append(h('span','mut','☑ '+pr.name));
    else if(pr.type==='number')w.append(h('span','mut',pr.name+': '+arn(v)));
    else if(pr.type==='person')w.append(h('span','mut','◍ '+v));
    else if(pr.type==='url')w.append(h('span','mut','↗ '+String(v).replace(/^https?:\/\//,'').slice(0,24)));
    else w.append(h('span','mut',String(v).slice(0,40)));
  });
  return w;
}
function noProp(el,msg,label,fn){const e=h('div','dbempty');e.append(h('span','',msg));const b=h('button','tb');b.innerHTML=IC.plus;b.append(h('span','',label));b.onclick=fn;e.append(b);el.append(e)}
let cardDrag=null;
function boardView(d,v,rs,el){
  const pr=propOf(d,v.groupBy)&&propOf(d,v.groupBy).type==='select'?propOf(d,v.groupBy):d.schema.find(s=>s.type==='select');
  if(!pr){noProp(el,'عرض اللوحة يحتاج خاصية من نوع "اختيار" لتجميع البطاقات.','إضافة خاصية الحالة',()=>{const p={id:uid(),name:'الحالة',type:'select',options:[{id:uid(),name:'لم يبدأ',color:'gray'},{id:uid(),name:'قيد التنفيذ',color:'blue'},{id:uid(),name:'مكتمل',color:'green'}]};d.schema.push(p);v.groupBy=p.id;save();refreshDB(d.id)});return}
  v.groupBy=pr.id;
  const bd=h('div','board');
  const cols=[...(pr.options||[]),{id:null,name:'بدون '+pr.name,color:'gray'}];
  cols.forEach(o=>{
    const items=rs.filter(r=>(val(r,pr)||null)===o.id);if(o.id===null&&!items.length)return;
    const col=h('div','bcol');col.style.setProperty('--k','var(--k-'+o.color+')');
    const hd=h('div','bcol-h');hd.append(pill(o),h('span','',arn(items.length)));col.append(hd);
    const cards=h('div','bcards');
    items.forEach(r=>{const c=h('div','card');c.tabIndex=0;c.setAttribute('role','button');c.draggable=true;c.append(h('div','ct',(r.icon?r.icon+' ':'')+tt(r)),chipsFor(d,r,[pr.id]));
      c.onclick=()=>openPage(r.id);c.onkeydown=e=>{if(e.key==='Enter')openPage(r.id)};
      c.addEventListener('dragstart',e=>{cardDrag=r.id;e.dataTransfer.effectAllowed='move';try{e.dataTransfer.setData('text/plain',r.id)}catch(x){}});c.addEventListener('dragend',()=>{cardDrag=null});
      cards.append(c)});
    col.append(cards);
    const add=h('button','dbadd');add.innerHTML=IC.plus;add.append(h('span','','جديد'));add.onclick=()=>{const r=addRow(d,o.id?{[pr.id]:o.id}:{});save();openPage(r.id,true)};col.append(add);
    col.addEventListener('dragover',e=>{if(!cardDrag)return;e.preventDefault();col.classList.add('over')});
    col.addEventListener('dragleave',e=>{if(!col.contains(e.relatedTarget))col.classList.remove('over')});
    col.addEventListener('drop',e=>{if(!cardDrag)return;e.preventDefault();col.classList.remove('over');const r=db.pages[cardDrag];cardDrag=null;if(r){setVal(r,pr,o.id);refreshDB(d.id)}});
    bd.append(col);
  });
  el.append(bd);
}
function calView(d,v,rs,el){
  const dp=propOf(d,v.dateProp)&&propOf(d,v.dateProp).type==='date'?propOf(d,v.dateProp):d.schema.find(s=>s.type==='date');
  if(!dp){noProp(el,'عرض التقويم يحتاج خاصية من نوع "تاريخ".','إضافة خاصية التاريخ',()=>{const p={id:uid(),name:'التاريخ',type:'date'};d.schema.push(p);v.dateProp=p.id;save();refreshDB(d.id)});return}
  v.dateProp=dp.id;
  const today=new Date();const base=v.month?parseISO(v.month+'-01'):new Date(today.getFullYear(),today.getMonth(),1);
  const y=base.getFullYear(),m=base.getMonth();
  const hd=h('div','cal-h');const tl=h('div');tl.append(h('h4','',MONTHS[m]+' '+ar(y)));const hj=hijri(new Date(y,m,15));if(hj)tl.append(h('small','',hj));
  const go=k=>{const nd=new Date(y,m+k,1);v.month=nd.getFullYear()+'-'+pad(nd.getMonth()+1);save();renderBody(d,v,el)};
  const prev=h('button','tb','→ السابق');prev.onclick=()=>go(-1);const td=h('button','tb','اليوم');td.onclick=()=>{v.month=null;save();renderBody(d,v,el)};const nx=h('button','tb','التالي ←');nx.onclick=()=>go(1);
  hd.append(tl,h('span','sp'),prev,td,nx);el.append(hd);
  const sc=h('div','calsc');const g=h('div','cal');DAYS.forEach(n=>g.append(h('div','dname',n)));
  const first=new Date(y,m,1);const off=first.getDay();const dim=new Date(y,m+1,0).getDate();const weeks=Math.ceil((off+dim)/7);const tISO=iso(today);
  for(let k=0;k<weeks*7;k++){
    const dt=new Date(y,m,1-off+k);const ds=iso(dt);
    const cell=h('div','day'+(dt.getMonth()!==m?' out':'')+(ds===tISO?' today':''));cell.append(h('span','dn',ar(dt.getDate())));
    rs.filter(r=>val(r,dp)===ds).forEach(r=>{const c=h('button','chip',(r.icon?r.icon+' ':'')+tt(r));c.draggable=true;c.title=tt(r);
      c.onclick=e=>{e.stopPropagation();openPage(r.id)};
      c.addEventListener('dragstart',e=>{cardDrag=r.id;e.dataTransfer.effectAllowed='move';try{e.dataTransfer.setData('text/plain',r.id)}catch(x){}});c.addEventListener('dragend',()=>{cardDrag=null});cell.append(c)});
    cell.title='إضافة في '+fmtDate(ds);
    cell.onclick=()=>{const r=addRow(d,{[dp.id]:ds});save();openPage(r.id,true)};
    cell.addEventListener('dragover',e=>{if(!cardDrag)return;e.preventDefault();cell.classList.add('over')});
    cell.addEventListener('dragleave',()=>cell.classList.remove('over'));
    cell.addEventListener('drop',e=>{if(!cardDrag)return;e.preventDefault();cell.classList.remove('over');const r=db.pages[cardDrag];cardDrag=null;if(r){setVal(r,dp,ds);renderBody(d,v,el)}});
    g.append(cell);
  }
  sc.append(g);el.append(sc);
  const und=rs.filter(r=>!val(r,dp)).length;if(und)el.append(h('div','dbcount',arn(und)+' صف بلا '+dp.name+' لا يظهر في التقويم'));
}
function listView(d,v,rs,el){
  rs.forEach(r=>{const b=h('button','lrow');b.append(h('span','',r.icon||'📄'),h('span','lt',tt(r)),chipsFor(d,r,[]));b.onclick=()=>openPage(r.id);el.append(b)});
  const add=h('button','dbadd');add.innerHTML=IC.plus;add.append(h('span','','جديد'));add.onclick=()=>{const r=addRow(d,{});save();openPage(r.id,true)};el.append(add,h('div','dbcount','العدد: '+arn(rs.length)));
}
function galView(d,v,rs,el){
  const g=h('div','gal');
  rs.forEach(r=>{const c=h('button','gcard');const pv=h('div','gprev');const txt=(r.blocks||[]).map(btxt).filter(Boolean).slice(0,4).join('\n');pv.textContent=txt||'';pv.dir=dirOf(txt);pv.style.whiteSpace='pre-wrap';
    const bd=h('div','gbody');bd.append(h('div','ct',(r.icon?r.icon+' ':'')+tt(r)),chipsFor(d,r,[]));bd.querySelector('.ct').style.fontWeight='500';c.append(pv,bd);c.onclick=()=>openPage(r.id);g.append(c)});
  const add=h('button','gcard');add.style.cssText='align-items:center;justify-content:center;min-height:170px;color:var(--faint);flex-direction:row;gap:6px';add.innerHTML=IC.plus+'<span>جديد</span>';add.onclick=()=>{const r=addRow(d,{});save();openPage(r.id,true)};g.append(add);
  el.append(g);
}
function propsPanel(p){
  const d=db.pages[p.parent];const box=h('div','props');box.id='propsHost';
  d.schema.filter(s=>s.type!=='title').forEach(pr=>{const rr=h('div','prow');const lb=h('button','plabel');lb.dataset.prop=pr.id;lb.innerHTML=glyph(pr);lb.append(h('span','',pr.name));lb.onclick=()=>propMenu(d,pr,lb);
    const vv=h('div','pval');vv.append(editor(d,p,pr,'page'));rr.append(lb,vv);box.append(rr)});
  const a=h('button','padd');a.innerHTML=IC.plus;a.append(h('span','','إضافة خاصية'));a.onclick=()=>addProp(d);box.append(a);
  return box;
}

/* ---------- whiteboard ---------- */
const NS='http://www.w3.org/2000/svg';
function sv(tag,attrs){const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);return e}
const WBC={yellow:'#fff1a6',orange:'#ffd5ad',pink:'#ffcce0',purple:'#e0d1ff',blue:'#cfe4ff',green:'#cdeec9',gray:'#e4e7e5',white:'#ffffff'};
const WBN={yellow:'أصفر',orange:'برتقالي',pink:'وردي',purple:'بنفسجي',blue:'أزرق',green:'أخضر',gray:'رمادي',white:'أبيض'};
const stroke=c=>(!c||c==='white'||c==='ink')?'var(--ink)':'var(--k-'+c+')';
const TI={
  select:S('<path d="M5 3l14 8-6.5 2L9.5 20z"/>',18),
  hand:S('<path d="M8 13V6a1.5 1.5 0 0 1 3 0v5M11 11V4.5a1.5 1.5 0 0 1 3 0V11M14 11V6a1.5 1.5 0 0 1 3 0v8a6 6 0 0 1-6 6h-.5a6 6 0 0 1-5-2.6L3.3 14.6a1.5 1.5 0 0 1 2.4-1.8L8 15"/>',18),
  sticky:S('<path d="M4 4h16v10l-6 6H4z"/><path d="M14 20v-6h6"/>',18),
  text:S('<path d="M5 7V4h14v3M12 4v16M9 20h6"/>',18),
  rect:S('<rect x="3" y="5" width="18" height="14" rx="2"/>',18),
  ellipse:S('<ellipse cx="12" cy="12" rx="9" ry="7"/>',18),
  diamond:S('<path d="M12 3l9 9-9 9-9-9z"/>',18),
  arrow:S('<path d="M5 19 19 5M10 5h9v9"/>',18),
  pen:S('<path d="M4 20l4-1L19 8l-3-3L5 16z"/><path d="M14 7l3 3"/>',18),
  frame:S('<path d="M7 3v18M17 3v18M3 7h18M3 17h18"/>',18),
  image:S('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',18),
  undo:S('<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',17),
  redo:S('<path d="m15 14 5-5-5-5"/><path d="M20 9H9a5 5 0 0 0 0 10h3"/>',17),
  fit:S('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',17),
  minus:S('<path d="M5 12h14"/>',17),
  plus:S('<path d="M12 5v14M5 12h14"/>',17),
  front:S('<rect x="8" y="8" width="12" height="12" rx="1" fill="currentColor"/><path d="M4 16V5a1 1 0 0 1 1-1h11"/>',16),
  back:S('<rect x="8" y="8" width="12" height="12" rx="1"/><path d="M4 16V5a1 1 0 0 1 1-1h11" /><rect x="4" y="4" width="0" height="0"/>',16),
  card:S('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/>',18),
  swap:S('<path d="M7 16h13M16 12l4 4-4 4M17 8H4M8 4 4 8l4 4"/>',16)
};
const WBTOOLS=[['select','تحديد','V'],['hand','تحريك اللوحة','H'],['sticky','ملاحظة لاصقة','N'],['text','نص','T'],['rect','مستطيل','R'],['ellipse','دائرة','O'],['diamond','معيّن','D'],['arrow','سهم','L'],['pen','قلم','P'],['frame','إطار','F'],['card','صفحة أو جدول','G'],['image','صورة','I']];
const MH=new Map(),FS=new Map();
const WB={p:null,tool:'select',sel:new Set(),edit:null,mode:null,drag:null,space:false,undo:[],redo:[],hid:null,pointers:new Map(),pinch:null,clip:null,pending:null,el:{},last:{}};
const byIdIn=(p,id)=>(p.items||[]).find(i=>i.id===id);
function fixDocWidth(p){(p.items||[]).forEach(i=>{if(i.type==='doc'&&i.w!==788){i.x+=i.w-788;i.w=788}})}
const isCanvas=p=>!!p&&(p.kind==='page'||p.kind==='db')&&p.mode==='canvas';
function ensureDocItem(p){p.items=p.items||[];let d=p.items.find(i=>i.type==='doc');if(!d){const others=p.items.filter(i=>!['arrow','pen'].includes(i.type));const u=union(others.map(i=>bb(i,p)));d={id:uid(),type:'doc',x:u?u.x-860:-394,y:u?u.y:-240,w:788};p.items.unshift(d)}if(d.w!==788)fixDocWidth(p);return d}
function blockToItem(b,pt){
  if(LINKT.includes(b.type)&&db.pages[b.pageId])return {id:uid(),type:'card',pageId:b.pageId,x:pt.x-130,y:pt.y-40,w:db.pages[b.pageId].kind==='db'?760:260};
  if(b.type==='image'&&b.src)return {id:uid(),type:'image',src:b.src,x:pt.x-160,y:pt.y-110,w:320,h:220};
  if(!TEXTY(b.type))return null;const t=btxt(b).trim();if(!t)return null;
  return {id:uid(),type:'sticky',x:pt.x-90,y:pt.y-90,w:180,h:180,color:b.type==='todo'&&b.checked?'green':(b.type==='callout'?'blue':'yellow'),text:t};
}
function sendToCanvas(b){
  const p=page();const d=ensureDocItem(p);const n=p.sendN||0;p.sendN=n+1;
  const it=blockToItem(b,{x:d.x+d.w+170+(n%3)*200,y:d.y+90+Math.floor(n/3)*200});if(!it){toast('هذا السطر فارغ');return}
  if(isCanvas(p)&&WB.p===p){addItems([it])}else{p.items.push(it);touch(p);save();toast('أُضيف إلى لوحة الصفحة',['عرض اللوحة',()=>{p.mode='canvas';save();renderPage()}])}
}
function boardSummaryBlocks(){const B=(type,html,x)=>Object.assign({id:uid(),type,html:html||''},x||{});return [
  B('h2','ملخص الجلسة'),
  B('p','هذا <b>مستند الصفحة نفسها</b>، يعيش على اللوحة بجانب الملاحظات والجداول. اكتب فيه كأي صفحة، واسحب أي سطر من مقبضه إلى اللوحة ليصير ملاحظة لاصقة.'),
  B('todo','التصويت على أفضل ٣ أفكار'),
  B('todo','تحويل الأفكار الفائزة إلى مهام في قاعدة البيانات'),
  B('p','حدّد أي ملاحظة وجرّب أزرار <b>مهام</b> و<b>قاعدة</b> و<b>صفحة</b> في الشريط العائم.',{color:'c-gray'})]}
function boardSeedFull(dbId){
  const it=boardSeedItems();const center=it.find(i=>i.type==='ellipse');const d={id:uid(),type:'doc',x:-1428,y:-330,w:788};it.unshift(d);
  it.push({id:uid(),type:'arrow',from:d.id,to:center.id,color:'gray',text:'نختار من هنا'});
  if(dbId){const c={id:uid(),type:'card',pageId:dbId,x:-440,y:420,w:900};it.push(c);
    const s={id:uid(),type:'sticky',x:520,y:470,w:190,h:190,color:'pink',text:'هذي المهمة لازم تخلص قبل الإطلاق!'};it.push(s);
    it.push({id:uid(),type:'arrow',from:s.id,to:null,p1:null,p2:{x:300,y:620},color:'red',text:''});}
  return it;
}
function toDocTasks(items){const p=WB.p;items.forEach(i=>p.blocks.push({id:uid(),type:'todo',html:esc(i.text.trim()).replace(/\n/g,'<br>')}));touch(p);save();renderPage();toast('أُضيفت '+arn(items.length)+' مهمة إلى مستند الصفحة')}
function replaceWithCards(pairs){
  const p=WB.p;mutate(()=>{pairs.forEach(([it,pid])=>{const c={id:uid(),type:'card',pageId:pid,x:it.x,y:it.y,w:Math.max(240,Math.min(it.w||240,320))};const k=p.items.indexOf(it);if(k<0)return;p.items.splice(k,1,c);
    p.items.forEach(a=>{if(a.type==='arrow'){if(a.from===it.id)a.from=c.id;if(a.to===it.id)a.to=c.id}})})});
  WB.sel=new Set();renderPage();
}
function toDB(d,items){
  const pairs=items.map(i=>{const r=addRow(d,{});const lines=i.text.trim().split('\n');r.title=lines[0];if(lines.length>1)r.blocks=lines.slice(1).map(l=>({id:uid(),type:'p',html:esc(l)}));return [i,r.id]});
  replaceWithCards(pairs);save();toast('أُضيفت '+arn(items.length)+' مهمة إلى "'+tt(d)+'"',['فتح',()=>openPage(d.id)]);
}
function dbPicker(anchor,items){
  openPop(anchor,el=>{el.append(h('div','sec','إضافة كصفوف في قاعدة بيانات'));
    Object.values(P()).filter(x=>x.kind==='db'&&alive(x)).forEach(d=>el.append(mi(tt(d),icn(d),()=>{closePop();toDB(d,items)})));
    el.append(h('hr'),mi('قاعدة بيانات جديدة في هذه الصفحة',IC.plus,()=>{closePop();const p=WB.p;const d=newDB(p.id,'مهام من اللوحة');rowsOf(d).forEach(r=>delete db.pages[r.id]);p.blocks.push({id:uid(),type:'db',pageId:d.id});toDB(d,items)}));
  },{width:'280px'});
}
function toPage(it){
  const lines=it.text.trim().split('\n');const np=mkPage({parent:WB.p.id,order:nextOrder(WB.p.id),icon:'📄',title:lines[0],blocks:lines.length>1?lines.slice(1).map(l=>({id:uid(),type:'p',html:esc(l)})):[{id:uid(),type:'p',html:''}]});
  WB.p.open=true;replaceWithCards([[it,np.id]]);save();toast('أصبحت الملاحظة صفحة مستقلة',['فتحها',()=>openPage(np.id)]);
}
function pagePicker(anchor){
  openPop(anchor,el=>{const inp=h('input','pin');inp.placeholder='ابحث عن صفحة أو جدول أو مهمة';const list=h('div');
    const draw=()=>{list.innerHTML='';const q=inp.value.trim().toLowerCase();
      Object.values(P()).filter(x=>alive(x)&&x.id!==WB.p.id&&(!q||tt(x).toLowerCase().includes(q))).sort((a,b)=>(b.kind==='db')-(a.kind==='db')||b.updated-a.updated).slice(0,12).forEach(x=>{
        const b=mi(tt(x),icn(x)||'📄',()=>{closePop();const vc=viewCenter();const w=x.kind==='db'?760:260;addItems([{id:uid(),type:'card',pageId:x.id,x:vc.x-w/2,y:vc.y-80,w}]);setTool('select')});
        const par=db.pages[x.parent];b.querySelector('.tx').append(h('small','',x.kind==='db'?'جدول حي':par?tt(par):'مساحة العمل'));list.append(b)})};
    inp.oninput=draw;el.append(h('div','sec','ضع صفحة أو جدولاً على اللوحة'),inp,list);draw()},{width:'300px'});
}
function bb(it,p){
  if(it.type==='pen'){const xs=it.points.map(q=>q[0]),ys=it.points.map(q=>q[1]);const x=Math.min(...xs),y=Math.min(...ys);return {x,y,w:Math.max(...xs)-x,h:Math.max(...ys)-y}}
  if(it.type==='arrow'){const q=arrowPts(it,p);if(!q)return {x:0,y:0,w:0,h:0};const x=Math.min(q[0].x,q[1].x),y=Math.min(q[0].y,q[1].y);return {x,y,w:Math.abs(q[0].x-q[1].x),h:Math.abs(q[0].y-q[1].y)}}
  return {x:it.x,y:it.y,w:it.w,h:['text','card','doc'].includes(it.type)?(MH.get(it.id)||it.h||(it.type==='doc'?420:it.type==='card'?120:40)):it.h};
}
function union(bs){if(!bs.length)return null;const x=Math.min(...bs.map(b=>b.x)),y=Math.min(...bs.map(b=>b.y));return {x,y,w:Math.max(...bs.map(b=>b.x+b.w))-x,h:Math.max(...bs.map(b=>b.y+b.h))-y}}
function edgePt(b,pt){const cx=b.x+b.w/2,cy=b.y+b.h/2,dx=pt.x-cx,dy=pt.y-cy;if(!dx&&!dy)return {x:cx,y:cy};const hw=b.w/2+6,hh=b.h/2+6;const t=Math.min(dx?hw/Math.abs(dx):1e9,dy?hh/Math.abs(dy):1e9);return t>=1?{x:pt.x,y:pt.y}:{x:cx+dx*t,y:cy+dy*t}}
function arrowPts(a,p){
  const f=a.from&&byIdIn(p,a.from),t=a.to&&byIdIn(p,a.to);
  const c=o=>{const b=bb(o,p);return {x:b.x+b.w/2,y:b.y+b.h/2}};
  const p1=f?c(f):a.p1,p2=t?c(t):a.p2;if(!p1||!p2)return null;
  return [f?edgePt(bb(f,p),p2):p1,t?edgePt(bb(t,p),p1):p2];
}
function penPath(pts){if(!pts.length)return '';if(pts.length<3)return 'M'+pts.map(q=>q[0]+' '+q[1]).join('L');let d='M'+pts[0][0]+' '+pts[0][1];
  for(let i=1;i<pts.length-1;i++){const mx=(pts[i][0]+pts[i+1][0])/2,my=(pts[i][1]+pts[i+1][1])/2;d+='Q'+pts[i][0]+' '+pts[i][1]+' '+mx+' '+my}const l=pts[pts.length-1];return d+'L'+l[0]+' '+l[1]}
function fitSticky(el){const w=el.clientWidth,hh=el.clientHeight;if(!w||!hh)return;const key=el.textContent+'|'+w+'|'+hh;if(FS.has(key)){el.style.fontSize=FS.get(key)+'px';return}
  let fs=Math.min(40,Math.max(12,Math.round(w*.12)));el.style.fontSize=fs+'px';while(fs>9&&(el.scrollHeight>hh+1||el.scrollWidth>w+1)){fs--;el.style.fontSize=fs+'px'}FS.set(key,fs)}
function itemEl(it,o){
  const shape=['rect','ellipse','diamond'].includes(it.type);
  const e=h('div','it it-'+it.type+(shape?' it-shape':'')+(o.sel&&o.sel.has(it.id)?' sel':''));e.dataset.id=it.id;
  e.style.left=it.x+'px';e.style.top=it.y+'px';e.style.width=it.w+'px';if(!['text','card','doc'].includes(it.type))e.style.height=it.h+'px';
  const tx=()=>{const t=h('div','itx');t.textContent=it.text||'';t.dir=dirOf(it.text);return t};
  switch(it.type){
    case 'sticky':e.style.background=WBC[it.color]||WBC.yellow;e.append(tx());break;
    case 'rect':case 'ellipse':case 'diamond':{
      const s=sv('svg',{class:'shp',viewBox:'0 0 '+it.w+' '+it.h,preserveAspectRatio:'none'});const st=stroke(it.color);let shp;
      if(it.type==='rect')shp=sv('rect',{x:1.5,y:1.5,width:Math.max(0,it.w-3),height:Math.max(0,it.h-3),rx:10});
      else if(it.type==='ellipse')shp=sv('ellipse',{cx:it.w/2,cy:it.h/2,rx:Math.max(0,it.w/2-1.5),ry:Math.max(0,it.h/2-1.5)});
      else shp=sv('polygon',{points:it.w/2+',1.5 '+(it.w-1.5)+','+it.h/2+' '+it.w/2+','+(it.h-1.5)+' 1.5,'+it.h/2});
      shp.setAttribute('style','fill:color-mix(in srgb, '+st+' 15%, var(--raised));stroke:'+st+';stroke-width:2;vector-effect:non-scaling-stroke');
      s.append(shp);e.append(s);const t=tx();t.style.fontSize=(it.fs||18)+'px';e.append(t);break}
    case 'text':{const t=tx();t.style.fontSize=(it.fs||24)+'px';t.style.color=stroke(it.color);if(it.bold)t.style.fontWeight='700';e.append(t);break}
    case 'frame':{const t=h('div','ftitle itx',it.text||'إطار');t.dataset.id=it.id;t.dir=dirOf(it.text);e.append(t);if(it.color&&!['gray','white'].includes(it.color))e.style.background='color-mix(in srgb, '+stroke(it.color)+' 9%, var(--raised))';break}
    case 'image':{const im=h('img');im.src=it.src;im.alt='';im.draggable=false;e.append(im);break}
    case 'doc':{e.dir='rtl';const t=o.page;const hd=h('div','doc-head');hd.append(h('span','',(icn(t)||'📄')+' '+tt(t)));e.append(hd);
      if(t.kind==='db'){const n=rowsOf(t).length;e.append(h('div','doc-prev','قاعدة بيانات • '+arn(n)+' صف'))}else{const pv=h('div','doc-prev');pv.textContent=(t.blocks||[]).map(btxt).filter(Boolean).slice(0,10).join('\n');e.append(pv)}break}
    case 'card':{e.dir='rtl';const t=db.pages[it.pageId];
      if(!alive(t)){e.classList.add('gone');e.append(h('div','cardt','صفحة محذوفة'));break}
      const hd=h('div','cardt');hd.append(h('span','',icn(t)||'📄'),h('span','',tt(t)));e.append(hd);
      if(t.kind==='db'){
        if(o.static){e.append(h('div','cardp','قاعدة بيانات • '+arn(rowsOf(t).length)+' صف'))}
        else{e.classList.add('live');const body=h('div','doc-body card-body');const host=h('div','dbhost');host.dataset.dbhost=t.id;host.dataset.inline='0';renderDB(t,host,false);body.append(host);e.append(body)}
      }else if(t.isRow&&db.pages[t.parent]){e.append(chipsFor(db.pages[t.parent],t,[]))}
      else{const txt=(t.blocks||[]).map(btxt).filter(Boolean).slice(0,3).join('\n');if(txt){const pp=h('div','cardp',txt);pp.dir=dirOf(txt);e.append(pp)}}
      if(!o.static){const op=h('button','cardopen','فتح ←');op.onclick=()=>{openPage(t.id)};e.append(op)}
      break}
  }
  if(it.votes)e.append(h('span','vote','👍 '+ar(it.votes)));
  if(!o.static&&o.sel&&o.sel.size===1&&o.sel.has(it.id)&&!o.edit){const hd=h('div','hdl');hd.dataset.h='1';hd.dataset.id=it.id;e.append(hd)}
  return e;
}
function buildWorld(p,world,o){
  o=o||{};o.page=p;const items=p.items||[];
  const keep=o.docEl&&o.docEl.parentNode===world?o.docEl:null;
  [...world.childNodes].forEach(c=>{if(c!==keep)c.remove()});
  const back=sv('svg',{class:'wbs'}),front=sv('svg',{class:'wbs'});
  const before=el=>keep?world.insertBefore(el,keep):world.append(el);
  items.filter(i=>i.type==='frame').forEach(it=>before(itemEl(it,o)));
  const dIt=o.noDoc?null:items.find(i=>i.type==='doc');
  if(dIt){
    if(o.docEl){const de=o.docEl;de.dataset.id=dIt.id;de.style.left=dIt.x+'px';de.style.top=dIt.y+'px';de.style.width=dIt.w+'px';de.classList.toggle('sel',!!(o.sel&&o.sel.has(dIt.id)));
      const old=de.querySelector(':scope > .hdl');if(old)old.remove();
      if(!keep)world.append(de);}
    else world.append(itemEl(dIt,o));
  }else if(keep)keep.remove();
  world.append(back);
  items.filter(i=>!['frame','pen','arrow','doc'].includes(i.type)).forEach(it=>world.append(itemEl(it,o)));
  world.append(front);
  world.querySelectorAll('.it-text,.it-card,.it-doc').forEach(el=>MH.set(el.dataset.id,el.offsetHeight));
  items.forEach(it=>{
    const sel=o.sel&&o.sel.has(it.id);
    if(it.type==='arrow'){const q=arrowPts(it,p);if(!q)return;const[s,e]=q;const col=sel?'var(--drop)':stroke(it.color);const d='M'+s.x+' '+s.y+'L'+e.x+' '+e.y;
      front.append(sv('path',{d,stroke:col,'stroke-width':sel?3:2.4,fill:'none','stroke-linecap':'round'}));
      const an=Math.atan2(e.y-s.y,e.x-s.x),L=13,W=.45;
      front.append(sv('path',{d:'M'+e.x+' '+e.y+'L'+(e.x-L*Math.cos(an-W))+' '+(e.y-L*Math.sin(an-W))+'L'+(e.x-L*Math.cos(an+W))+' '+(e.y-L*Math.sin(an+W))+'Z',fill:col}));
      if(!o.static)front.append(sv('path',{d,stroke:'transparent','stroke-width':16,fill:'none','data-id':it.id,class:'hit'}));
      if(it.text||o.edit===it.id){const lb=h('div','alabel itx');lb.dataset.id=it.id;lb.textContent=it.text||'';lb.dir=dirOf(it.text);lb.style.left=(s.x+e.x)/2+'px';lb.style.top=(s.y+e.y)/2+'px';world.append(lb)}
    }
    if(it.type==='pen'){const d=penPath(it.points);front.append(sv('path',{d,stroke:stroke(it.color),'stroke-width':it.sw||3,fill:'none','stroke-linecap':'round','stroke-linejoin':'round','data-pen':it.id}));
      if(!o.static)front.append(sv('path',{d,stroke:'transparent','stroke-width':14,fill:'none','data-id':it.id,class:'hit'}));
      if(sel){const b=bb(it,p);front.append(sv('rect',{x:b.x-6,y:b.y-6,width:b.w+12,height:b.h+12,fill:'none',stroke:'var(--drop)','stroke-dasharray':'5 4','vector-effect':'non-scaling-stroke'}))}}
  });
  world.querySelectorAll('.it-sticky .itx').forEach(fitSticky);
}

/* templates */
function tplBrainstorm(center,ideas){
  const out=[];const c={id:uid(),type:'ellipse',x:-130,y:-75,w:260,h:150,color:'purple',text:center,fs:20};out.push(c);
  const cols=['yellow','green','blue','pink','orange','yellow'];
  ideas.forEach((t,i)=>{const a=-Math.PI/2+i*2*Math.PI/ideas.length;const s={id:uid(),type:'sticky',w:180,h:180,x:Math.cos(a)*360-90,y:Math.sin(a)*290-90,color:cols[i%cols.length],text:t[0]};if(t[1])s.votes=t[1];out.push(s);out.push({id:uid(),type:'arrow',from:c.id,to:s.id,color:'gray'})});
  return out;
}
function tplRetro(){
  const cols=[['ما نجح','green',['التواصل اليومي كان واضحاً','أنهينا نقل قاعدة البيانات بدون توقف']],['ما يحتاج تحسين','pink',['تأخر مراجعة التصاميم','اختبارات أقل من اللازم']],['أفكار للتجربة','blue',['جلسة تصميم أسبوعية','قائمة تحقق قبل كل إطلاق']]];
  const out=[];cols.forEach(([t,c,notes],i)=>{const x=260-i*400;out.push({id:uid(),type:'frame',x,y:-260,w:370,h:560,text:t,color:c});notes.forEach((n,k)=>out.push({id:uid(),type:'sticky',x:x+95,y:-210+k*230,w:180,h:180,color:c,text:n}))});
  out.unshift({id:uid(),type:'text',x:-540,y:-360,w:1170,h:50,fs:36,bold:true,color:'ink',text:'استعادة السبرنت'});return out;
}
function tplFlow(){
  const s={id:uid(),type:'ellipse',x:-90,y:-380,w:180,h:80,color:'green',text:'البداية'};
  const a={id:uid(),type:'rect',x:-110,y:-240,w:220,h:90,color:'blue',text:'إدخال البريد وكلمة المرور'};
  const d={id:uid(),type:'diamond',x:-120,y:-90,w:240,h:150,color:'orange',text:'البيانات صحيحة؟'};
  const ok={id:uid(),type:'rect',x:-110,y:130,w:220,h:90,color:'blue',text:'فتح لوحة التحكم'};
  const er={id:uid(),type:'rect',x:-430,y:-60,w:200,h:90,color:'red',text:'رسالة خطأ'};
  const A=(f,t,tx)=>({id:uid(),type:'arrow',from:f.id,to:t.id,color:'gray',text:tx||''});
  return [s,a,d,ok,er,A(s,a),A(a,d),A(d,ok,'نعم'),A(d,er,'لا'),A(er,a,'إعادة المحاولة')];
}
function boardSeedItems(){
  const it=tplBrainstorm('كيف نجذب أول ١٠٠ عميل؟',[['شراكة مع حاضنات الأعمال في جدة والرياض',3],['نسخة مجانية للفرق الصغيرة',5],['قوالب جاهزة للجهات الحكومية',2],['محتوى تعليمي بالعربي',1],['تكامل مع واتساب للأعمال',4],['البيانات داخل المملكة كميزة أساسية',6]]);
  it.unshift({id:uid(),type:'text',x:-440,y:-470,w:880,h:50,fs:36,bold:true,color:'ink',text:'عصف ذهني: خطة الإطلاق'});
  it.push({id:uid(),type:'frame',x:560,y:-300,w:330,h:420,text:'للأسبوع القادم',color:'yellow'});
  it.push({id:uid(),type:'sticky',x:635,y:-250,w:180,h:180,color:'yellow',text:'اختيار أعلى ٣ أفكار بالتصويت'});
  it.push({id:uid(),type:'text',x:590,y:-40,w:270,h:30,fs:16,color:'gray',text:'صوّت بتحديد الملاحظة ثم 👍'});
  return it;
}

/* page */
function newBoard(parent){
  const p=mkPage({parent,order:nextOrder(parent),icon:'🎨',mode:'canvas',items:[]});
  if(parent){db.pages[parent].open=true;db.pages[parent].blocks.push({id:uid(),type:'wb',pageId:p.id})}
  openPage(p.id);save();return p;
}
function renderBoardPage(p,docEl){
  if(WB.hid!==p.id){WB.hid=p.id;WB.undo=[];WB.redo=[];WB.sel=new Set();WB.edit=null;WB.tool='select'}
  WB.p=p;p.items=p.items||[];WB.docEl=docEl||null;
  const root=h('div','wb');
  const hd=h('div','wbhead');
  const ib=h('button','wbicon',p.icon||'🎨');ib.setAttribute('aria-label','تغيير الأيقونة');ib.onclick=()=>iconPicker(ib,v=>{p.icon=v;touch(p);renderPage();save()},true);
  const ti=h('h1','wbtitle');ti.id='title';ti.dataset.ph='بدون عنوان';ti.textContent=p.title;ti.dir=dirOf(p.title);if(!p.locked){ti.contentEditable=PCE;bindTitle(ti)}
  const cnt=h('span','wbcnt');hd.append(ib,ti,cnt);
  const vp=h('div','wbv t-select');vp.dir='ltr';
  const world=h('div','wbw');vp.append(world);
  const marq=h('div','marq');marq.hidden=true;vp.append(marq);
  const tools=h('div','wbtools');tools.setAttribute('role','toolbar');tools.setAttribute('aria-label','أدوات اللوحة');
  WBTOOLS.forEach(([t,l,k],i)=>{if(i===2||i===4||i===7)tools.append(h('span','tsep'));const b=h('button');b.innerHTML=TI[t];b.dataset.tool=t;b.title=l+' ('+k+')';b.setAttribute('aria-label',l);b.onclick=()=>{if(t==='image'){pickImage(null);return}if(t==='card'){pagePicker(b);return}setTool(t)};tools.append(b)});
  const zb=h('div','wbzoom');
  const un=h('button');un.innerHTML=TI.undo;un.title='تراجع (Ctrl+Z)';un.setAttribute('aria-label','تراجع');un.onclick=wbUndo;
  const re=h('button');re.innerHTML=TI.redo;re.title='إعادة (Ctrl+Shift+Z)';re.setAttribute('aria-label','إعادة');re.onclick=wbRedo;
  const zo=h('button');zo.innerHTML=TI.minus;zo.title='تصغير';zo.setAttribute('aria-label','تصغير');zo.onclick=()=>zoomBy(1/1.25);
  const pct=h('button','pct');pct.title='العودة إلى ١٠٠٪';pct.onclick=()=>{const r=vp.getBoundingClientRect();zoomAt(1/cam().z,r.left+r.width/2,r.top+r.height/2)};
  const zi=h('button');zi.innerHTML=TI.plus;zi.title='تكبير';zi.setAttribute('aria-label','تكبير');zi.onclick=()=>zoomBy(1.25);
  const ft=h('button');ft.innerHTML=TI.fit;ft.title='إظهار كل المحتوى (Shift+1)';ft.setAttribute('aria-label','إظهار كل المحتوى');ft.onclick=fitBoard;
  zb.append(un,re,h('span','tsep'),zo,pct,zi,ft);
  const sb=h('div','wbsel');sb.hidden=true;
  const em=h('div','wbempty');const box=h('div','box');box.append(h('b','','أضف بجانب المستند:'));
  const tg=h('div','tgrid');
  [['💡','عصف ذهني',()=>tplBrainstorm('الفكرة الرئيسية',[['فكرة'],['فكرة'],['فكرة'],['فكرة'],['فكرة'],['فكرة']])],['🔁','استعادة السبرنت',tplRetro],['🔀','مخطط انسيابي',tplFlow]]
    .forEach(([i,l,fn])=>{const b=h('button');b.append(h('span','',i),h('span','',l));b.onclick=()=>{const its=fn();const d=ensureDocItem(p);const u=union(its.filter(i=>!['arrow','pen'].includes(i.type)).map(i=>({x:i.x,y:i.y,w:i.w,h:i.h||40})));
      const dx=d.x+d.w+160-u.x,dy=d.y-u.y;its.forEach(i=>{if(i.x!=null){i.x+=dx;i.y+=dy}});mutate(()=>{p.items.push(...its)});fitBoard()};tg.append(b)});
  const x=h('button','emx');x.innerHTML=IC.x;x.setAttribute('aria-label','إخفاء');x.onclick=()=>{WB.noEmpty=p.id;em.hidden=true};
  box.append(tg,x);em.append(box);
  root.append(vp,hd,tools,zb,sb,em);
  WB.el={root,vp,world,marq,tools,sb,em,pct,cnt,un,re};
  bindBoard(vp);
  docWrap.append(root);
  setTool(WB.tool);
  drawAll();
  requestAnimationFrame(()=>{if(!p.cam)fitBoard();else applyCam()});
}
function ovOrigin(p){const d=(p.items||[]).find(i=>i.type==='doc');return d?{x:d.x+d.w-66,y:d.y+48}:{x:0,y:0}}
function computeOv(){const art=WB.el.root;const bl=art.querySelector('.blocks')||art;const a=art.getBoundingClientRect(),b=bl.getBoundingClientRect();const o=ovOrigin(WB.p);WB.ovCam={x:b.right-a.left-o.x,y:b.top-a.top-o.y,z:1};applyCam()}
function renderOverlay(p,art){
  if(WB.hid!==p.id){WB.hid=p.id;WB.undo=[];WB.redo=[];WB.sel=new Set();WB.edit=null;WB.tool='select'}
  if(['hand','frame','diamond'].includes(WB.tool))WB.tool='select';
  WB.p=p;WB.ov=true;WB.docEl=null;p.items=p.items||[];ensureDocItem(p);
  const vp=h('div','ovl t-select');vp.dir='ltr';const world=h('div','wbw');vp.append(world);const marq=h('div','marq');marq.hidden=true;vp.append(marq);
  const tools=h('div','wbtools ovtools');tools.setAttribute('role','toolbar');tools.setAttribute('aria-label','أدوات الرسم على الصفحة');
  [['select','تحديد','V'],['sticky','ملاحظة لاصقة','N'],['text','نص حر','T'],['rect','مستطيل','R'],['ellipse','دائرة','O'],['arrow','سهم','L'],['pen','قلم','P'],['card','صفحة أو جدول','G'],['image','صورة','I']].forEach(([t,l,k],i)=>{
    if(i===1||i===3||i===7)tools.append(h('span','tsep'));const b=h('button');b.innerHTML=TI[t];b.dataset.tool=t;b.title=l+' ('+k+')';b.setAttribute('aria-label',l);
    b.onclick=()=>{if(t==='image'){pickImage(null);return}if(t==='card'){pagePicker(b);return}setTool(WB.tool===t&&t!=='select'?'select':t)};tools.append(b)});
  tools.append(h('span','tsep'));
  const un=h('button');un.innerHTML=TI.undo;un.title='تراجع';un.setAttribute('aria-label','تراجع');un.onclick=wbUndo;
  const re=h('button');re.innerHTML=TI.redo;re.title='إعادة';re.setAttribute('aria-label','إعادة');re.onclick=wbRedo;tools.append(un,re);
  const sb=h('div','wbsel');sb.hidden=true;
  art.append(vp,sb);docWrap.append(tools);
  WB.el={root:art,vp,world,marq,tools,sb,em:null,pct:null,cnt:null,un,re};
  bindBoard(vp);setTool(WB.tool);computeOv();drawAll();
}
const cam=()=>WB.ov?WB.ovCam:(WB.p.cam||(WB.p.cam={x:0,y:0,z:1}));
function applyCam(){
  const c=cam(),{world,vp,pct}=WB.el;if(!world)return;
  world.style.transform='translate('+c.x+'px,'+c.y+'px) scale('+c.z+')';world.style.setProperty('--iz',1/c.z);
  if(WB.ov){positionSelBar();return}
  vp.style.backgroundPosition=c.x+'px '+c.y+'px';const g=24*c.z;vp.style.backgroundSize=g+'px '+g+'px';
  pct.textContent=ar(Math.round(c.z*100))+'٪';positionSelBar();saveCamSoon();
}
let camT;function saveCamSoon(){clearTimeout(camT);camT=setTimeout(()=>opts.cacheLocal(db),500)}
function zoomAt(f,cx,cy){const c=cam(),r=WB.el.vp.getBoundingClientRect();const mx=cx-r.left,my=cy-r.top;const nz=Math.min(4,Math.max(.1,c.z*f));c.x=mx-(mx-c.x)*(nz/c.z);c.y=my-(my-c.y)*(nz/c.z);c.z=nz;applyCam()}
function zoomBy(f){const r=WB.el.vp.getBoundingClientRect();zoomAt(f,r.left+r.width/2,r.top+r.height/2)}
function fitBoard(){
  if(WB.ov)return;const p=WB.p,r=WB.el.vp.getBoundingClientRect();const c=cam();
  const u=union((p.items||[]).map(i=>bb(i,p)));
  if(!u){c.z=1;c.x=r.width/2;c.y=r.height/2;applyCam();return}
  c.z=Math.min(1.2,Math.max(.1,Math.min((r.width-180)/(u.w||1),(r.height-160)/(u.h||1))));
  c.x=r.width/2-(u.x+u.w/2)*c.z;c.y=r.height/2-(u.y+u.h/2)*c.z+20;applyCam();
}
function setTool(t){WB.tool=t;if(!WB.el.tools)return;WB.el.tools.querySelectorAll('button').forEach(b=>{b.classList.toggle('on',b.dataset.tool===t);b.setAttribute('aria-pressed',b.dataset.tool===t)});WB.el.vp.className=(WB.ov?'ovl'+(t!=='select'?' draw':''):'wbv')+' t-'+t}
function drawAll(){
  if(!WB.el.world||!WB.p)return;
  buildWorld(WB.p,WB.el.world,{sel:WB.sel,edit:WB.edit,docEl:WB.docEl,noDoc:WB.ov});
  const n=WB.p.items.filter(i=>i.type!=='doc').length;if(WB.el.cnt)WB.el.cnt.textContent=arn(n)+' عنصر';
  if(WB.el.em)WB.el.em.hidden=n>0||WB.noEmpty===WB.p.id;
  updateSelBar();updateHist();
}
function updateHist(){if(!WB.el.un)return;WB.el.un.disabled=!WB.undo.length;WB.el.re.disabled=!WB.redo.length}
function commit(){const cur=JSON.stringify(WB.p.items);if(WB.pending!=null&&WB.pending!==cur){WB.undo.push(WB.pending);if(WB.undo.length>80)WB.undo.shift();WB.redo=[];touch(WB.p);save()}WB.pending=cur;updateHist()}
function mutate(fn){WB.pending=JSON.stringify(WB.p.items);fn();commit();drawAll()}
function wbUndo(){if(!WB.undo.length)return;WB.redo.push(JSON.stringify(WB.p.items));WB.p.items=JSON.parse(WB.undo.pop());WB.pending=JSON.stringify(WB.p.items);pruneSel();touch(WB.p);save();drawAll()}
function wbRedo(){if(!WB.redo.length)return;WB.undo.push(JSON.stringify(WB.p.items));WB.p.items=JSON.parse(WB.redo.pop());WB.pending=JSON.stringify(WB.p.items);pruneSel();touch(WB.p);save();drawAll()}
function pruneSel(){WB.sel=new Set([...WB.sel].filter(id=>byIdIn(WB.p,id)))}
function W(e){const r=WB.el.vp.getBoundingClientRect(),c=cam();return {x:(e.clientX-r.left-c.x)/c.z,y:(e.clientY-r.top-c.y)/c.z}}
function hitAt(x,y,skip){const els=document.elementsFromPoint(x,y);for(const el of els){const t=el.closest&&el.closest('[data-id]');if(t&&WB.el.world.contains(t)){const id=t.dataset.id;const it=byIdIn(WB.p,id);if(it&&!(skip&&skip(it)))return {id,handle:!!el.closest('.hdl')}}}return {}}
function inside(o,f){const b=bb(o,WB.p);return b.x>=f.x&&b.y>=f.y&&b.x+b.w<=f.x+f.w&&b.y+b.h<=f.y+f.h}
const EDITABLE=['sticky','rect','ellipse','diamond','text','frame','arrow'];
function startEdit(id){
  const p=WB.p,it=byIdIn(p,id);if(!it||!EDITABLE.includes(it.type)||p.locked)return;
  WB.pending=JSON.stringify(p.items);WB.edit=id;WB.sel=new Set([id]);drawAll();
  const sel=it.type==='frame'?'.ftitle[data-id="'+id+'"]':it.type==='arrow'?'.alabel[data-id="'+id+'"]':'.it[data-id="'+id+'"] .itx';
  const el=WB.el.world.querySelector(sel);if(!el)return;
  el.contentEditable=PCE;el.classList.add('editing');el.focus({preventScroll:true});
  const r=document.createRange();r.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(r);
  el.oninput=()=>{it.text=el.textContent;el.dir=dirOf(it.text);if(it.type==='sticky')fitSticky(el)};
  el.onkeydown=e=>{e.stopPropagation();if(e.key==='Escape'||(e.key==='Enter'&&(e.ctrlKey||e.metaKey||it.type==='frame'||it.type==='arrow'))){e.preventDefault();el.blur()}};
  el.onblur=()=>{if(WB.edit===id)endEdit()};
  el.onpaste=e=>{e.preventDefault();document.execCommand('insertText',false,(e.clipboardData||window.clipboardData).getData('text/plain'))};
  WB.el.sb.hidden=true;
}
function endEdit(){
  const id=WB.edit;WB.edit=null;const it=byIdIn(WB.p,id);
  if(it&&it.type==='text'&&!(it.text||'').trim()){WB.p.items=WB.p.items.filter(x=>x!==it);WB.sel.delete(id)}
  commit();drawAll();
}
function addItems(items,pt){
  const p=WB.p;mutate(()=>{p.items.push(...items)});WB.sel=new Set(items.map(i=>i.id));drawAll();
}
function pickImage(pt){
  const inp=h('input');inp.type='file';inp.accept='image/*';
  inp.onchange=()=>{const f=inp.files&&inp.files[0];if(f)placeImage(f,pt)};inp.click();
}
function viewCenter(){const r=WB.el.vp.getBoundingClientRect(),m=$('#main').getBoundingClientRect(),c=cam();const sx=(Math.max(r.left,m.left)+Math.min(r.right,m.right))/2,sy=(Math.max(r.top,m.top+46)+Math.min(r.bottom,m.bottom))/2;return {x:(sx-r.left-c.x)/c.z,y:(sy-r.top-c.y)/c.z}}
function placeImage(f,pt){
  loadImage(f,src=>{const im=new Image();im.onload=()=>{let w=im.width,hh=im.height;const m=420;if(w>m){hh=hh*m/w;w=m}
    if(!pt)pt=viewCenter();
    const it={id:uid(),type:'image',src,x:pt.x-w/2,y:pt.y-hh/2,w,h:hh};addItems([it]);setTool('select')};im.src=src});
}
function bindBoard(vp){
  vp.addEventListener('pointerdown',onDown);
  vp.addEventListener('pointermove',onMove);
  vp.addEventListener('pointerup',onUp);
  vp.addEventListener('pointercancel',onUp);
  vp.addEventListener('dblclick',e=>{
    if(WB.p.locked||e.target.closest('.doc-body'))return;const tg=hitAt(e.clientX,e.clientY);
    if(tg.id){const it=byIdIn(WB.p,tg.id);if(it&&it.type==='card'){openPage(it.pageId);return}startEdit(tg.id);return}
    if(WB.tool!=='select')return;const pt=W(e);
    const it={id:uid(),type:'sticky',w:200,h:200,x:pt.x-100,y:pt.y-100,color:WB.last.sticky||'yellow',text:''};
    mutate(()=>WB.p.items.push(it));startEdit(it.id);
  });
  vp.addEventListener('wheel',e=>{if(WB.ov)return;e.preventDefault();if(e.ctrlKey||e.metaKey)zoomAt(Math.exp(-e.deltaY*.01),e.clientX,e.clientY);else{const c=cam();c.x-=e.deltaX;c.y-=e.deltaY;applyCam()}},{passive:false});
  vp.addEventListener('dragover',e=>{const ty=[...(e.dataTransfer?e.dataTransfer.types:[])];if(ty.includes('Files')||ty.includes('application/x-midad-page')||(dragId&&!e.target.closest('.doc-body')))e.preventDefault()});
  vp.addEventListener('drop',e=>{
    if(e.target.closest('.doc-body'))return;
    const pid=e.dataTransfer&&e.dataTransfer.getData('application/x-midad-page');
    if(pid&&db.pages[pid]&&pid!==WB.p.id){e.preventDefault();const pt=W(e);const w=db.pages[pid].kind==='db'?760:260;addItems([{id:uid(),type:'card',pageId:pid,x:pt.x-w/2,y:pt.y-40,w}]);return}
    if(dragId){const b=findBlock(dragId);if(b){e.preventDefault();clearDrop();const it=blockToItem(b,W(e));if(it){addItems([it]);toast('صار السطر ملاحظة على اللوحة')}}return}
const fs=[...(e.dataTransfer?e.dataTransfer.files:[])].filter(f=>f.type.startsWith('image/'));if(!fs.length)return;e.preventDefault();const pt=W(e);fs.forEach((f,i)=>placeImage(f,{x:pt.x+i*30,y:pt.y+i*30}))});
  vp.addEventListener('contextmenu',e=>e.preventDefault());
}
function onDown(e){
  const p=WB.p;if(e.button===2)return;
  if(e.target.closest('.cardopen'))return;
  if(e.target.closest('.doc-body')&&WB.tool==='select'&&!WB.space&&e.button===0)return;
  WB.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(WB.pointers.size===2){const[a,b]=[...WB.pointers.values()];const c=cam();WB.mode=null;WB.drag=null;WB.el.marq.hidden=true;
    WB.pinch={d0:Math.hypot(a.x-b.x,a.y-b.y)||1,z0:c.z,m0:{x:(a.x+b.x)/2,y:(a.y+b.y)/2},c0:{x:c.x,y:c.y}};return}
  if(WB.edit){if(e.target.closest('.editing'))return;endEdit()}
  e.preventDefault();
  try{WB.el.vp.setPointerCapture(e.pointerId)}catch(x){}
  const pt=W(e);const tg=hitAt(e.clientX,e.clientY);WB.pending=JSON.stringify(p.items);
  const tool=WB.tool,c=cam();
  if(WB.ov&&document.activeElement&&document.activeElement!==document.body&&!WB.el.vp.contains(document.activeElement))document.activeElement.blur();
  if(!WB.ov&&(tool==='hand'||e.button===1||WB.space||(p.locked&&!tg.id))){WB.mode='pan';WB.drag={sx:e.clientX,sy:e.clientY,cx:c.x,cy:c.y};WB.el.vp.classList.add('panning');return}
  if(p.locked){WB.sel=tg.id?new Set([tg.id]):new Set();drawAll();return}
  if(tool==='select'){
    if(tg.handle){const it=byIdIn(p,tg.id);if(!it||['pen','arrow','doc'].includes(it.type))return;WB.mode='resize';WB.drag={it,x0:pt.x,y0:pt.y,w0:it.w,h0:it.h,ratio:it.type==='image'?it.h/it.w:(it.type==='sticky'?1:null)};return}
    if(tg.id){
      if(e.shiftKey){WB.sel.has(tg.id)?WB.sel.delete(tg.id):WB.sel.add(tg.id)}else if(!WB.sel.has(tg.id))WB.sel=new Set([tg.id]);
      const ids=new Set(WB.sel);[...WB.sel].forEach(id=>{const f=byIdIn(p,id);if(f&&f.type==='frame')p.items.forEach(o=>{if(o!==f&&o.type!=='arrow'&&inside(o,f))ids.add(o.id)})});
      WB.mode='move';WB.drag={x0:pt.x,y0:pt.y,moved:false,orig:[...ids].map(id=>byIdIn(p,id)).filter(Boolean).map(it=>({it,x:it.x,y:it.y,pts:it.points?it.points.map(q=>q.slice()):null,p1:it.p1?{...it.p1}:null,p2:it.p2?{...it.p2}:null}))};
      drawAll();return;
    }
    if(!e.shiftKey)WB.sel=new Set();
    WB.mode='marquee';WB.drag={sx:e.clientX,sy:e.clientY,base:new Set(WB.sel)};drawAll();return;
  }
  if(tool==='sticky'||tool==='text'){
    const it=tool==='sticky'?{type:'sticky',w:200,h:200,color:WB.last.sticky||'yellow',text:''}:{type:'text',w:280,h:40,fs:24,color:WB.last.text||'ink',text:''};
    it.id=uid();it.x=pt.x-(tool==='sticky'?100:20);it.y=pt.y-(tool==='sticky'?100:20);p.items.push(it);commit();setTool('select');startEdit(it.id);return;
  }
  if(['rect','ellipse','diamond','frame'].includes(tool)){
    const n=p.items.filter(i=>i.type==='frame').length+1;
    const it={id:uid(),type:tool,x:pt.x,y:pt.y,w:1,h:1,color:tool==='frame'?'gray':(WB.last.shape||'blue'),text:tool==='frame'?'إطار '+ar(n):''};
    p.items.push(it);WB.sel=new Set([it.id]);WB.mode='create';WB.drag={it,x0:pt.x,y0:pt.y};drawAll();return;
  }
  if(tool==='arrow'){
    const f=tg.id&&byIdIn(p,tg.id);const from=f&&!['arrow','pen','doc'].includes(f.type)&&!(f.type==='card'&&e.target.closest('.doc-body'))?f.id:null;
    const a={id:uid(),type:'arrow',from,to:null,p1:from?null:pt,p2:pt,color:WB.last.arrow||'gray',text:''};
    p.items.push(a);WB.mode='arrow';WB.drag={a,x0:pt.x,y0:pt.y};drawAll();return;
  }
  if(tool==='pen'){const s={id:uid(),type:'pen',points:[[Math.round(pt.x),Math.round(pt.y)]],color:WB.last.pen||'blue',sw:3};p.items.push(s);WB.mode='pen';WB.drag={s};drawAll();return}
}
function onMove(e){
  if(WB.pointers.has(e.pointerId))WB.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(WB.pinch){if(WB.pointers.size<2)return;const[a,b]=[...WB.pointers.values()];const pc=WB.pinch,c=cam(),r=WB.el.vp.getBoundingClientRect();
    const nz=Math.min(4,Math.max(.1,pc.z0*Math.hypot(a.x-b.x,a.y-b.y)/pc.d0));const m={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
    const wx=(pc.m0.x-r.left-pc.c0.x)/pc.z0,wy=(pc.m0.y-r.top-pc.c0.y)/pc.z0;c.z=nz;c.x=m.x-r.left-wx*nz;c.y=m.y-r.top-wy*nz;applyCam();return}
  if(!WB.mode)return;
  const pt=W(e),d=WB.drag;
  switch(WB.mode){
    case 'pan':{const c=cam();c.x=d.cx+e.clientX-d.sx;c.y=d.cy+e.clientY-d.sy;applyCam();break}
    case 'move':{const dx=pt.x-d.x0,dy=pt.y-d.y0;if(!d.moved&&Math.hypot(dx,dy)*cam().z<3)return;d.moved=true;
      d.orig.forEach(o=>{if(o.it.x!=null){o.it.x=Math.round(o.x+dx);o.it.y=Math.round(o.y+dy)}if(o.pts)o.it.points=o.pts.map(q=>[q[0]+dx,q[1]+dy]);if(o.p1)o.it.p1={x:o.p1.x+dx,y:o.p1.y+dy};if(o.p2)o.it.p2={x:o.p2.x+dx,y:o.p2.y+dy}});
      drawAll();WB.el.sb.hidden=true;break}
    case 'resize':{const it=d.it;let w=Math.max(it.type==='doc'?360:it.type==='card'?200:40,d.w0+pt.x-d.x0),hh=Math.max(30,d.h0+pt.y-d.y0);if(d.ratio)hh=w*d.ratio;it.w=Math.round(w);if(!['text','doc','card'].includes(it.type))it.h=Math.round(hh);drawAll();WB.el.sb.hidden=true;break}
    case 'create':{const it=d.it;it.x=Math.min(d.x0,pt.x);it.y=Math.min(d.y0,pt.y);it.w=Math.abs(pt.x-d.x0);it.h=Math.abs(pt.y-d.y0);if(e.shiftKey){const m=Math.max(it.w,it.h);it.w=it.h=m}drawAll();break}
    case 'arrow':{d.a.p2=pt;drawAll();break}
    case 'pen':{d.s.points.push([Math.round(pt.x),Math.round(pt.y)]);const path=WB.el.world.querySelector('[data-pen="'+d.s.id+'"]');if(path)path.setAttribute('d',penPath(d.s.points));else drawAll();break}
    case 'marquee':{const r=WB.el.vp.getBoundingClientRect();const x1=Math.min(d.sx,e.clientX),y1=Math.min(d.sy,e.clientY),x2=Math.max(d.sx,e.clientX),y2=Math.max(d.sy,e.clientY);
      const m=WB.el.marq;m.hidden=false;m.style.left=(x1-r.left)+'px';m.style.top=(y1-r.top)+'px';m.style.width=(x2-x1)+'px';m.style.height=(y2-y1)+'px';
      const c=cam();const wx1=(x1-r.left-c.x)/c.z,wy1=(y1-r.top-c.y)/c.z,wx2=(x2-r.left-c.x)/c.z,wy2=(y2-r.top-c.y)/c.z;
      const s=new Set(d.base);WB.p.items.forEach(it=>{const b=bb(it,WB.p);if(b.x<wx2&&b.x+b.w>wx1&&b.y<wy2&&b.y+b.h>wy1){if(it.type==='frame'&&!(b.x>=wx1&&b.y>=wy1&&b.x+b.w<=wx2&&b.y+b.h<=wy2))return;s.add(it.id)}});
      WB.sel=s;drawAll();WB.el.sb.hidden=true;break}
  }
}
function onUp(e){
  WB.pointers.delete(e.pointerId);
  if(WB.pinch){if(WB.pointers.size<2)WB.pinch=null;return}
  const m=WB.mode,d=WB.drag,p=WB.p;WB.mode=null;WB.drag=null;WB.el.vp.classList.remove('panning');
  switch(m){
    case 'create':{const it=d.it;if(it.w<14&&it.h<14){const def={rect:[200,110],ellipse:[170,170],diamond:[200,140],frame:[560,380]}[it.type];it.w=def[0];it.h=def[1];it.x=d.x0-it.w/2;it.y=d.y0-it.h/2}
      it.x=Math.round(it.x);it.y=Math.round(it.y);it.w=Math.round(it.w);it.h=Math.round(it.h);setTool('select');commit();drawAll();if(it.type!=='frame')startEdit(it.id);break}
    case 'arrow':{const a=d.a;const tg=hitAt(e.clientX,e.clientY,it=>it.id===a.id||it.type==='arrow'||it.type==='pen'||it.id===a.from);
      const tgi=tg.id&&byIdIn(p,tg.id);const overBody=document.elementsFromPoint(e.clientX,e.clientY).some(x=>x.closest&&x.closest('.doc-body'));
      if(tgi&&tgi.type!=='doc'&&!overBody){a.to=tg.id;a.p2=null}
      const q=arrowPts(a,p);if(!a.to&&(!q||Math.hypot(q[0].x-q[1].x,q[0].y-q[1].y)<12)){p.items=p.items.filter(x=>x!==a)}else WB.sel=new Set([a.id]);
      setTool('select');commit();drawAll();break}
    case 'pen':{if(d.s.points.length<2)p.items=p.items.filter(x=>x!==d.s);commit();drawAll();break}
    case 'marquee':WB.el.marq.hidden=true;drawAll();break;
    case 'move':if(d.moved)commit();drawAll();break;
    case 'resize':commit();drawAll();break;
  }
}
function selItems(){return [...WB.sel].map(id=>byIdIn(WB.p,id)).filter(Boolean)}
function cloneItems(items,off){
  const map={};const out=items.map(it=>{const c=JSON.parse(JSON.stringify(it));c.id=uid();map[it.id]=c.id;if(c.x!=null){c.x+=off;c.y+=off}if(c.points)c.points=c.points.map(q=>[q[0]+off,q[1]+off]);if(c.p1)c.p1={x:c.p1.x+off,y:c.p1.y+off};if(c.p2)c.p2={x:c.p2.x+off,y:c.p2.y+off};delete c.votes;return c});
  out.forEach(c=>{if(c.type==='arrow'){if(c.from)c.from=map[c.from]||null;if(c.to)c.to=map[c.to]||null;const src=items.find(x=>map[x.id]===c.id);if(!c.from&&src&&src.from){const q=arrowPts(src,WB.p);if(q)c.p1={x:q[0].x+off,y:q[0].y+off}}if(!c.to&&src&&src.to){const q=arrowPts(src,WB.p);if(q)c.p2={x:q[1].x+off,y:q[1].y+off}}}});
  return out;
}
function duplicateSel(){const s=selItems().filter(i=>i.type!=='doc');if(!s.length)return;const c=cloneItems(s,30);mutate(()=>WB.p.items.push(...c));WB.sel=new Set(c.map(x=>x.id));drawAll()}
function deleteSel(){const ids=new Set([...WB.sel].filter(id=>{const it=byIdIn(WB.p,id);return it&&it.type!=='doc'}));if(!ids.size)return;mutate(()=>{WB.p.items=WB.p.items.filter(it=>!ids.has(it.id)&&!(it.type==='arrow'&&(ids.has(it.from)||ids.has(it.to))))});WB.sel=new Set();drawAll()}
function pasteClip(){const src=JSON.parse(WB.clip);WB.pasteN=(WB.pasteN||0)+1;const c=cloneItems(src,30*WB.pasteN);mutate(()=>WB.p.items.push(...c));WB.sel=new Set(c.map(x=>x.id));drawAll()}
function positionSelBar(){
  const sb=WB.el.sb;if(!sb||sb.hidden)return;const s=selItems();const u=union(s.map(i=>bb(i,WB.p)));if(!u){sb.hidden=true;return}
  const c=cam(),R=WB.el.root.getBoundingClientRect(),V=WB.el.vp.getBoundingClientRect();
  const x=V.left-R.left+c.x+(u.x+u.w/2)*c.z,y1=V.top-R.top+c.y+u.y*c.z,y2=V.top-R.top+c.y+(u.y+u.h)*c.z;
  const w=sb.offsetWidth,hh=sb.offsetHeight;let top=y1-hh-(s.some(i=>i.type==='frame')?40:16);if(top<60)top=y2+16;
  sb.style.left=Math.max(8,Math.min(x-w/2,R.width-w-8))+'px';sb.style.top=Math.min(top,R.height-hh-8)+'px';
}
function updateSelBar(){
  const sb=WB.el.sb;if(!sb)return;const s=selItems();
  if(!s.length||WB.mode||WB.edit||WB.p.locked){sb.hidden=true;return}
  sb.innerHTML='';
  const types=new Set(s.map(i=>i.type));
  const colorable=s.filter(i=>!['image','doc','card'].includes(i.type));
  if(colorable.length){
    const keys=Object.keys(WBC).filter(k=>!(k==='white'&&!types.has('sticky')));
    keys.forEach(k=>{const b=h('button','sw');const stickyOnly=[...types].every(t=>t==='sticky');b.style.background=stickyOnly?WBC[k]:(k==='white'?'var(--ink)':'var(--k-'+k+')');
      b.title=WBN[k];b.setAttribute('aria-label','اللون '+WBN[k]);if(colorable.every(i=>i.color===k))b.classList.add('on');
      b.onclick=()=>{mutate(()=>colorable.forEach(i=>{i.color=k;const key=i.type==='sticky'?'sticky':['rect','ellipse','diamond'].includes(i.type)?'shape':i.type;WB.last[key]=k}))};sb.append(b)});
    sb.append(h('span','tsep'));
  }
  if(types.has('text')||types.has('rect')||types.has('ellipse')||types.has('diamond')){
    [['ص',16],['م',24],['ك',36],['ض',56]].forEach(([l,fs])=>{const b=h('button','tb2',l);b.title='حجم الخط '+ar(fs);const tx=s.filter(i=>['text','rect','ellipse','diamond'].includes(i.type));if(tx.every(i=>(i.fs||(i.type==='text'?24:18))===fs))b.classList.add('on');
      b.onclick=()=>mutate(()=>tx.forEach(i=>i.fs=fs));sb.append(b)});
    if(types.has('text')){const b=h('button','tb2');b.innerHTML=IC.bold;b.title='عريض';const tx=s.filter(i=>i.type==='text');if(tx.every(i=>i.bold))b.classList.add('on');b.onclick=()=>mutate(()=>{const v=!tx.every(i=>i.bold);tx.forEach(i=>i.bold=v)});sb.append(b)}
    sb.append(h('span','tsep'));
  }
  const textual=s.filter(i=>['sticky','text','rect','ellipse','diamond'].includes(i.type)&&(i.text||'').trim());
  if(textual.length&&!WB.p.isRow){
    const a=h('button','tb2 lab');a.innerHTML=IC.check+'<span>مهام</span>';a.title='إضافتها كمهام في مستند الصفحة';a.onclick=()=>toDocTasks(textual);
    const b=h('button','tb2 lab');b.innerHTML=IC.data+'<span>قاعدة</span>';b.title='تحويلها إلى صفوف في قاعدة بيانات';b.onclick=()=>dbPicker(b,textual);sb.append(a,b);
    if(textual.length===1){const c=h('button','tb2 lab');c.innerHTML=IC.open+'<span>صفحة</span>';c.title='تحويلها إلى صفحة مستقلة';c.onclick=()=>toPage(textual[0]);sb.append(c)}
    sb.append(h('span','tsep'));
  }
  if(s.length===1&&s[0].type==='card'&&alive(db.pages[s[0].pageId])){const o=h('button','tb2','فتح');o.onclick=()=>openPage(s[0].pageId);sb.append(o,h('span','tsep'))}
  if(s.length===1&&s[0].type==='doc')sb.append(h('span','scount','مستند الصفحة • اسحبه من شريطه العلوي'));
  const votable=s.filter(i=>['sticky','rect','ellipse','diamond','image','card'].includes(i.type));
  if(votable.length){const v=h('button','tb2','👍');v.title='تصويت';v.onclick=()=>mutate(()=>votable.forEach(i=>i.votes=(i.votes||0)+1));sb.append(v);
    if(votable.some(i=>i.votes)){const m=h('button','tb2','−');m.title='إلغاء صوت';m.onclick=()=>mutate(()=>votable.forEach(i=>{if(i.votes)i.votes--}));sb.append(m)}sb.append(h('span','tsep'))}
  if(types.size===1&&types.has('arrow')){const b=h('button','tb2');b.innerHTML=TI.swap;b.title='عكس الاتجاه';b.onclick=()=>mutate(()=>s.forEach(a=>{[a.from,a.to]=[a.to,a.from];[a.p1,a.p2]=[a.p2,a.p1]}));sb.append(b)}
  if(s.length===1&&EDITABLE.includes(s[0].type)){const b=h('button','tb2','تحرير');b.title='تحرير النص (Enter)';b.onclick=()=>startEdit(s[0].id);sb.append(b)}
  const fr=h('button','tb2');fr.innerHTML=TI.front;fr.title='إلى الأمام';fr.onclick=()=>mutate(()=>{const ids=new Set(WB.sel);WB.p.items=[...WB.p.items.filter(i=>!ids.has(i.id)),...WB.p.items.filter(i=>ids.has(i.id))]});
  const bk=h('button','tb2');bk.innerHTML=TI.back;bk.title='إلى الخلف';bk.onclick=()=>mutate(()=>{const ids=new Set(WB.sel);WB.p.items=[...WB.p.items.filter(i=>ids.has(i.id)),...WB.p.items.filter(i=>!ids.has(i.id))]});
  const du=h('button','tb2');du.innerHTML=IC.dup;du.title='تكرار (Ctrl+D)';du.onclick=duplicateSel;
  const de=h('button','tb2 del');de.innerHTML=IC.trash;de.title='حذف (Delete)';de.onclick=deleteSel;
  if(s.every(i=>i.type==='doc'))sb.append(fr,bk);else sb.append(fr,bk,du,de);
  if(s.length>1)sb.prepend(h('span','scount',arn(s.length)));
  sb.hidden=false;positionSelBar();
}
function boardActive(){const p=page();return !!p&&WB.p===p&&WB.el.world&&document.contains(WB.el.world)}
document.addEventListener('keydown',e=>{
  if(!boardActive())return;const t=e.target;
  if(t.isContentEditable||/INPUT|TEXTAREA|SELECT/.test(t.tagName))return;
  if(!findEl.hidden||!popEl.hidden||!$('#txtModal').hidden)return;
  const mod=e.ctrlKey||e.metaKey,k=(e.code||'').replace('Key','').toLowerCase();
  if(e.key===' '&&!mod){if(WB.ov)return;e.preventDefault();if(!WB.space){WB.space=true;WB.el.vp.classList.add('panning')}return}
  if(mod&&k==='z'){e.preventDefault();e.shiftKey?wbRedo():wbUndo();return}
  if(mod&&k==='y'){e.preventDefault();wbRedo();return}
  if(WB.p.locked)return;
  if(mod&&k==='d'){e.preventDefault();duplicateSel();return}
  if(mod&&k==='a'){e.preventDefault();WB.sel=new Set(WB.p.items.map(i=>i.id));drawAll();return}
  if(mod&&k==='c'){if(WB.sel.size){WB.clip=JSON.stringify(selItems().filter(i=>i.type!=='doc'));WB.pasteN=0;toast('نُسخ '+arn(WB.sel.size)+' عنصر')}return}
  if(mod&&k==='x'){if(WB.sel.size){WB.clip=JSON.stringify(selItems().filter(i=>i.type!=='doc'));WB.pasteN=0;deleteSel()}return}
  if(mod&&k==='v'){if(WB.clip){e.preventDefault();pasteClip()}return}
  if(e.key==='Delete'||e.key==='Backspace'){if(WB.sel.size){e.preventDefault();deleteSel()}return}
  if(e.key==='Escape'){if(WB.sel.size||WB.tool!=='select'){WB.sel=new Set();setTool('select');drawAll()}return}
  if(e.key==='Enter'&&WB.sel.size===1){e.preventDefault();startEdit([...WB.sel][0]);return}
  if(e.key.startsWith('Arrow')&&WB.sel.size){e.preventDefault();const st=e.shiftKey?10:1;const dx=e.key==='ArrowLeft'?-st:e.key==='ArrowRight'?st:0,dy=e.key==='ArrowUp'?-st:e.key==='ArrowDown'?st:0;
    mutate(()=>selItems().forEach(it=>{if(it.x!=null){it.x+=dx;it.y+=dy}if(it.points)it.points=it.points.map(q=>[q[0]+dx,q[1]+dy]);if(it.p1)it.p1={x:it.p1.x+dx,y:it.p1.y+dy};if(it.p2)it.p2={x:it.p2.x+dx,y:it.p2.y+dy}}));return}
  if(mod)return;
  if(!WB.ov){if(e.key==='+'||e.key==='='){zoomBy(1.25);return}if(e.key==='-'){zoomBy(1/1.25);return}}
  if(e.shiftKey&&(e.code==='Digit1')){e.preventDefault();fitBoard();return}
  if(k==='g'){e.preventDefault();const b=WB.el.tools.querySelector('[data-tool="card"]');if(b)pagePicker(b);return}
  const map={v:'select',h:'hand',n:'sticky',t:'text',r:'rect',o:'ellipse',d:'diamond',l:'arrow',p:'pen',f:'frame'};
  if(map[k]){e.preventDefault();setTool(map[k]);return}
  if(k==='i'){e.preventDefault();pickImage(null)}
});
document.addEventListener('keyup',e=>{if(e.key===' '&&WB.space){WB.space=false;if(WB.el.vp)WB.el.vp.classList.remove('panning')}});
document.addEventListener('paste',e=>{
  if(!boardActive())return;const t=e.target;if(t.isContentEditable||/INPUT|TEXTAREA/.test(t.tagName))return;
  const fs=[...((e.clipboardData&&e.clipboardData.files)||[])].filter(f=>f.type.startsWith('image/'));
  if(fs.length){e.preventDefault();fs.forEach(f=>placeImage(f,null));return}
  const txt=e.clipboardData&&e.clipboardData.getData('text/plain');
  if(txt&&!WB.clip){e.preventDefault();const vc=viewCenter();const cx=vc.x,cy=vc.y;
    const lines=txt.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).slice(0,30);const cols=Math.ceil(Math.sqrt(lines.length));
    addItems(lines.map((l,i)=>({id:uid(),type:'sticky',w:180,h:180,x:cx+(i%cols)*200-cols*100,y:cy+Math.floor(i/cols)*200-100,color:WB.last.sticky||'yellow',text:l})));
    toast('أُضيفت '+arn(lines.length)+' ملاحظة من النص الملصوق')}
});
function boardPreview(t,pv){
  const w=h('div','wbw');pv.append(w);buildWorld(t,w,{static:true});
  const items=t.items||[];if(!items.length){pv.append(h('div','pv-empty','لوحة فارغة. افتحها لتبدأ'));return}
  const u=union(items.map(i=>bb(i,t)));const W2=pv.clientWidth||600,H2=pv.clientHeight||260;
  const z=Math.min((W2-40)/(u.w||1),(H2-50)/(u.h||1),1);
  w.style.transform='translate('+(W2/2-(u.x+u.w/2)*z)+'px,'+(H2/2-(u.y+u.h/2)*z+8)+'px) scale('+z+')';
  const g=Math.max(14,24*z);pv.style.backgroundSize=g+'px '+g+'px';
}

/* ---------- quick find ---------- */
const findEl=$('#find'),findIn=$('#findInput'),findList=$('#findList');let findIdx=0,findItems=[];
$('#fsIcon').insertAdjacentHTML('afterbegin',IC.search);
function openFind(){findEl.hidden=false;findIn.value='';findIdx=0;drawFind();findIn.focus()}
function closeFind(){findEl.hidden=true}
function drawFind(){
  const q=findIn.value.trim().toLowerCase();findList.innerHTML='';
  const all=Object.values(P()).filter(alive);
  let res;
  if(!q){res=all.sort((a,b)=>b.updated-a.updated).slice(0,8).map(p=>({p}));findList.append(h('div','fnote','آخر الصفحات المعدّلة'))}
  else{res=[];all.forEach(p=>{if(tt(p).toLowerCase().includes(q)){res.push({p,score:2});return}const b=(p.blocks||[]).find(b=>btxt(b).toLowerCase().includes(q));if(b){res.push({p,snip:btxt(b),score:1});return}const it=(p.items||[]).find(i=>(i.text||'').toLowerCase().includes(q));if(it)res.push({p,snip:it.text,score:1})});res.sort((a,b)=>b.score-a.score||b.p.updated-a.p.updated);res=res.slice(0,12)}
  findItems=res;findIdx=Math.min(findIdx,Math.max(0,res.length-1));
  if(!res.length){findList.append(h('div','fnote','لا توجد نتائج لـ "'+findIn.value.trim()+'"'));return}
  res.forEach((it,k)=>{const b=h('button','fitem'+(k===findIdx?' on':''));b.append(h('span','fi',icn(it.p)||'📄'));const t=h('span','ft');t.append(h('span','',tt(it.p)));
    if(it.snip){const s=h('span','snip',it.snip);s.dir=dirOf(it.snip);t.append(s)}else{const par=db.pages[it.p.parent];t.append(h('small','',par?tt(par):'مساحة العمل'))}
    b.append(t);b.onclick=()=>{closeFind();openPage(it.p.id)};b.onmouseenter=()=>{findIdx=k;findList.querySelectorAll('.fitem').forEach((x,j)=>x.classList.toggle('on',j===k))};findList.append(b)});
}
findIn.addEventListener('input',()=>{findIdx=0;drawFind()});
findIn.addEventListener('keydown',e=>{
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(findItems.length){findIdx=(findIdx+(e.key==='ArrowDown'?1:-1)+findItems.length)%findItems.length;drawFind();const on=findList.querySelector('.on');if(on)on.scrollIntoView({block:'nearest'})}}
  if(e.key==='Enter'){e.preventDefault();const it=findItems[findIdx];if(it){closeFind();openPage(it.p.id)}}
  if(e.key==='Escape'){e.preventDefault();closeFind()}
});
findEl.addEventListener('mousedown',e=>{if(e.target===findEl)closeFind()});
$('#findBtn').onclick=openFind;

/* ---------- trash ---------- */
$('#trashBtn').onclick=()=>{
  openPop($('#trashBtn'),el=>{
    el.append(h('div','sec','سلة المحذوفات'));
    const roots=Object.values(P()).filter(p=>p.trashed&&p.trashRoot===p.id).sort((a,b)=>b.trashed-a.trashed);
    if(!roots.length){el.append(h('div','meta','السلة فارغة.'));return}
    roots.forEach(p=>{const rw=h('div','orow');const info=h('div','mi');info.style.cursor='default';info.append(h('span','gi',icn(p)||'📄'));const tx=h('span','tx');tx.append(h('span','',tt(p)),h('small','',rel(p.trashed)));info.append(tx);
      const rs=h('button','ox');rs.innerHTML=IC.restore;rs.title='استعادة';rs.setAttribute('aria-label','استعادة '+tt(p));rs.onclick=()=>{restorePage(p.id);closePop();openPage(p.id);toast('استُعيدت الصفحة')};
      const del=h('button','ox');del.innerHTML=IC.trash;del.title='حذف نهائي';del.setAttribute('aria-label','حذف نهائي');del.onclick=()=>{if(!del.dataset.arm){del.dataset.arm='1';del.style.color='var(--danger)';del.title='اضغط مرة ثانية للحذف النهائي';toast('اضغط أيقونة الحذف مرة ثانية للحذف النهائي');return}purgePage(p.id);rw.remove();toast('حُذفت نهائياً')};
      rw.append(info,rs,del);el.append(rw)});
    el.append(h('div','meta','الصفحات في السلة لا تظهر في البحث أو القائمة.'));
  },{width:'300px'});
};

/* ---------- data drawer ---------- */
const dataEl=$('#data');
function renderData(){
  const p=page();const hd=$('#dataHead'),tb=$('#dataRows');hd.innerHTML='';tb.innerHTML='';
  if(isCanvas(p)){
    $('#dataCaption').textContent='عناصر "'+tt(p)+'" تُحفظ في العمود items (jsonb) لصف اللوحة:';
    hd.innerHTML='<tr><th>type</th><th>text</th><th>x, y</th><th>color</th></tr>';
    (p.items||[]).forEach(i=>{const tr=h('tr');const t2=h('td');t2.append(h('span','pill',i.type+(i.votes?' 👍'+i.votes:'')));const c=h('td','txt',i.text||(i.type==='arrow'?'→':'—'));c.dir=dirOf(i.text);tr.append(t2,c,h('td','mono',i.x!=null?Math.round(i.x)+', '+Math.round(i.y):''),h('td','mono',i.color||''));tb.append(tr)});
    return;
  }
  if(p.kind==='db'){
    $('#dataCaption').textContent='صفوف "'+tt(p)+'" في جدول pages، وقيمها في العمود props:';
    hd.innerHTML='<tr><th>position</th><th>title</th><th>props</th></tr>';
    rowsOf(p).forEach(r=>{const tr=h('tr');tr.append(h('td','',String(r.order)),h('td','txt',tt(r)));const pj=h('td','mono',JSON.stringify(r.props||{}));pj.style.whiteSpace='normal';pj.style.wordBreak='break-all';tr.append(pj);tb.append(tr)});
  }else{
    $('#dataCaption').textContent='صفوف الصفحة "'+tt(p)+'" في جدول blocks:';
    hd.innerHTML='<tr><th>pos</th><th>type</th><th>indent</th><th>content</th><th>id</th></tr>';
    p.blocks.forEach((b,k)=>{const tr=h('tr');const t2=h('td');t2.append(h('span','pill',b.type+(b.type==='todo'&&b.checked?' ✓':'')));
      const raw=b.type==='code'?(b.code||''):LINKT.includes(b.type)?'→ '+tt(db.pages[b.pageId]):sanitize(b.html||'');
      const c=h('td','txt',raw||'—');c.dir=b.type==='code'?'ltr':dirOf(raw);c.title=raw;tr.append(h('td','',String(k)),t2,h('td','',String(b.indent||0)),c,h('td','mono',b.id));tb.append(tr)});
  }
}
function toggleData(on){dataEl.hidden=!on;if(on)renderData()}
$('#dataClose').onclick=()=>toggleData(false);

/* ---------- toast ---------- */
const toastEl=$('#toast');let toastT;
function toast(msg,action){clearTimeout(toastT);toastEl.innerHTML='';toastEl.append(h('span','',msg));if(action){const b=h('button','',action[0]);b.onclick=()=>{toastEl.hidden=true;action[1]()};toastEl.append(b)}toastEl.hidden=false;toastT=setTimeout(()=>toastEl.hidden=true,action?6000:2600)}

/* ---------- global keys & layout ---------- */
document.addEventListener('keydown',e=>{
  const mod=e.ctrlKey||e.metaKey;
  if(mod&&(e.key==='k'||e.key==='K')){
    e.preventDefault();const s=getSelection();
    if(s.rangeCount&&!s.isCollapsed){const n=s.getRangeAt(0).commonAncestorContainer;const el=(n.nodeType===1?n:n.parentElement);const c=el&&el.closest('.content');if(c&&blocksEl&&blocksEl.contains(c)&&!c.closest('.t-code')){fmtC=c;fmtRange=s.getRangeAt(0).cloneRange();updateFmt();drawFmt('link');return}}
    findEl.hidden?openFind():closeFind();return;
  }
  if(mod&&e.key==='\\'){e.preventDefault();toggleNav();return}
  if(e.key==='Escape'){if(!popEl.hidden){closePop();return}if(!fmtEl.hidden){hideFmt();return}if(!$('#txtModal').hidden){$('#txtModal').hidden=true;return}if(!dataEl.hidden){toggleData(false);return}$('#app').classList.remove('nav')}
});
function toggleNav(){if(innerWidth<=860)$('#app').classList.toggle('nav');else{$('#app').classList.toggle('collapsed');db.collapsed=$('#app').classList.contains('collapsed');save()}}
$('#collapse').onclick=toggleNav;
$('#openNav').onclick=()=>{if(innerWidth<=860)$('#app').classList.add('nav');else{$('#app').classList.remove('collapsed');db.collapsed=false;save()}};
$('#backdrop').onclick=()=>$('#app').classList.remove('nav');
$('#newPage').onclick=()=>newPage(null);
$('#newBoard').onclick=()=>newBoard(null);
$('#main').addEventListener('scroll',()=>{closeMenu();if(!popEl.hidden&&!popEl.contains(document.activeElement))closePop();hideFmt();$('#main').classList.toggle('scrolled',$('#main').scrollTop>4)},{passive:true});
addEventListener('resize',()=>{closeMenu();closePop();hideFmt();if(WB.ov&&WB.el.root&&document.contains(WB.el.root)){computeOv()}});
setInterval(()=>{if(page())statusEl.textContent='عُدّلت '+rel(page().updated)},60000);

if(db.collapsed)$('#app').classList.add('collapsed');
applyTheme();renderPage();
opts.cacheLocal(db);

/* ---------- واجهة لـ cloud.js: تطبيق تغييرات زملاء الفريق ---------- */
const api={
  get db(){return db},
  save,setStatus,toast,
  // يستبدل صفحات وصلت من الخادم؛ لا يعيد رسم الصفحة المفتوحة إذا كان المستخدم يكتب فيها الآن
  applyRemote(upserts,deletes){
    const cur=db.current,editing=document.activeElement&&$('#main').contains(document.activeElement)&&document.activeElement!==document.body;
    let curChanged=false;
    upserts.forEach(p=>{
      const old=db.pages[p.id];
      if(p.id===cur){if(editing)return;curChanged=true}
      // ندمج في نفس الكائن حتى تبقى المراجع التي تمسكها المحررات المفتوحة صالحة
      if(old){Object.keys(old).forEach(k=>{if(!(k in p))delete old[k]});Object.assign(old,p)}else db.pages[p.id]=p;
    });
    deletes.forEach(id=>{if(id===cur)curChanged=true;delete db.pages[id]});
    if(!db.pages[db.current]||!alive(db.pages[db.current]))db.current=(firstRoot()||newRoot()).id,curChanged=true;
    renderSide();
    if(curChanged&&!editing)renderPage();
    opts.cacheLocal(db);
  }
};
if(opts.onReady)opts.onReady(api);
return api;
};
