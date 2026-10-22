// scripts/enrich-json.js
// Usage: node scripts/enrich-json.js
//
// Enriches every card in every session JSON with:
//   **bold**      → Latin terms: diseases, drugs, tests, genes, microbes
//   ==highlight== → Persian disease names / key syndromes
//   ++green++     → numbers with units
//   @@warning@@   → dangerous / critical phrases
//
// Skips anything already wrapped. Idempotent (safe to re-run).
// قبل از اجرا بکاپ بگیرید:  cp -r src/data/sessions src/data/sessions.bak

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SESSIONS_DIR = path.join(__dirname, '..', 'src', 'data', 'sessions');

// ─────────────────────────────────────────────────────────────
// TERM LISTS — اصطلاحات کورس گوارش
// ─────────────────────────────────────────────────────────────

const BOLD_TERMS = [
  // Genes
  'APC', 'KRAS', 'NRAS', 'BRAF', 'TP53', 'SMAD4', 'SMAD2', 'CDH1', 'CTNNB1',
  'MLH1', 'MSH2', 'MSH6', 'PMS2', 'EPCAM', 'STK11', 'PTEN', 'CDKN2A',
  'PIK3CA', 'ERBB2', 'HER2', 'EGFR', 'MET', 'NTRK', 'IDH1', 'IDH2',
  'TERT', 'ARID1A', 'NOD2', 'ATG16L1', 'IL23R', 'HFE', 'ATP7B', 'A1AT',
  'CFTR', 'PRSS1', 'SPINK1', 'UGT1A1', 'HLA-DQ2', 'HLA-DQ8', 'JAK2',

  // Microbes
  'H. pylori', 'HBV', 'HCV', 'HDV', 'HEV', 'HAV', 'EBV', 'CMV',
  'C. difficile', 'Salmonella', 'Shigella', 'Campylobacter', 'Yersinia',
  'E. coli', 'Vibrio cholerae', 'Giardia', 'Entamoeba', 'Cryptosporidium',
  'Strongyloides', 'Ascaris', 'Taenia', 'Echinococcus', 'Tropheryma whipplei',

  // Diseases / abbreviations
  'GERD', 'NERD', 'PUD', 'IBD', 'UC', 'CD', 'IBS', 'FAP', 'CRC', 'HCC',
  'CCA', 'PanIN', 'IPMN', 'MCN', 'SPEN', 'GIST', 'NET', 'NAFLD', 'NASH',
  'MASLD', 'MASH', 'PSC', 'PBC', 'AIH', 'DILI', 'SBP', 'HE', 'HRS',
  'UGIB', 'LGIB', 'OGIB', 'SBBO', 'SBS', 'EGD', 'EUS', 'ERCP', 'MRCP',

  // Scores / staging
  'MELD', 'CTP', 'Child-Pugh', 'RUCAM', 'APACHE', 'SOFA', 'qSOFA',
  'FIB-4', 'APRI', 'NFS', 'TNM', 'AJCC', 'RECIST', 'Rockall', 'Glasgow-Blatchford',
  'Forrest', 'Los Angeles', 'DeMeester', 'Ranson', 'BISAP', 'Atlanta',

  // Procedures / imaging
  'PEG', 'PEJ', 'TIPS', 'TACE', 'RFA', 'TARE', 'EMR', 'ESD', 'POEM',
  'NOTES', 'CT', 'MRI', 'MRCP', 'EUS', 'US', 'PET', 'FNA', 'FNB',

  // Labs
  'ALT', 'AST', 'ALP', 'GGT', 'INR', 'PT', 'aPTT', 'Hb', 'MCV', 'WBC',
  'Plt', 'CRP', 'ESR', 'BUN', 'Cr', 'Na', 'K', 'Ca', 'Mg', 'Phos',
  'CEA', 'CA19-9', 'AFP', 'CA125', 'HBsAg', 'anti-HCV', 'HCV RNA',
  'HBV DNA', 'HIV', 'FOBT', 'FIT', 'Hct', 'LDH', 'Albumin', 'Bilirubin',

  // Drugs — acid suppression / motility
  'Omeprazole', 'Pantoprazole', 'Esomeprazole', 'Lansoprazole', 'Rabeprazole',
  'Ranitidine', 'Famotidine', 'Sucralfate', 'Misoprostol', 'Ondansetron',
  'Metoclopramide', 'Domperidone', 'Erythromycin', 'Prucalopride', 'Loperamide',

  // Drugs — H. pylori / infection
  'Amoxicillin', 'Clarithromycin', 'Azithromycin', 'Metronidazole',
  'Tinidazole', 'Tetracycline', 'Bismuth', 'Rifaximin', 'Lactulose',
  'Ciprofloxacin', 'Ceftriaxone', 'Vancomycin', 'Fidaxomicin', 'Norfloxacin',

  // Drugs — IBD / immune
  'Mesalamine', 'Sulfasalazine', 'Azathioprine', 'Mercaptopurine',
  'Methotrexate', 'Infliximab', 'Adalimumab', 'Golimumab', 'Certolizumab',
  'Vedolizumab', 'Ustekinumab', 'Tofacitinib', 'Upadacitinib', 'Prednisone',
  'Budesonide', 'Hydrocortisone',

  // Drugs — liver / pancreas / portal HTN
  'Entecavir', 'Tenofovir', 'Sofosbuvir', 'Ledipasvir', 'Daclatasvir',
  'Ribavirin', 'Ursodiol', 'Obeticholic', 'Spironolactone', 'Furosemide',
  'Propranolol', 'Carvedilol', 'Nadolol', 'Terlipressin', 'Octreotide',
  'Lanreotide', 'Sorafenib', 'Lenvatinib', 'Regorafenib', 'Sunitinib',
  'Everolimus', 'Pancrelipase',

  // Scores / signs (English)
  'Courvoisier', 'Murphy', 'Cullen', 'Grey-Turner', 'Blumberg', 'McBurney',
  'Rovsing', 'Psoas', 'Obturator', 'Charcot', 'Reynolds', 'Cruveilhier',
  'Caput medusae', 'Spider angiomata', 'Asterixis', 'Dumping',

  // Other
  'Whipple', 'Billroth', 'Roux-en-Y', 'Kasai', 'MELD-Na', 'HBV', 'H. pylori',
];

const HIGHLIGHT_TERMS = [
  // Esophagus
  'رفلاکس معده به مری', 'ازوفاژیت', 'مری بارت', 'آشالازی', 'اسپاسم مری',
  'مری نورموکینتیک', 'زخم مری', 'واریس مری', 'تنگی مری', 'دیسفاژی',
  'اودینوفاژی', 'سوزش سر دل', 'هرنی هیاتال',

  // Stomach / duodenum
  'گاستریت', 'گاستریت آتروفیک', 'گاستریت حاد', 'گاستریت مزمن', 'زخم پپتیک',
  'زخم دوازدهه', 'زخم معده', 'سندرم زولینگر-الیسون', 'گاستروپارزی',
  'سندرم دامپینگ', 'متاپلازی روده‌ای', 'دیسپپسی', 'سوءهاضمه',

  // Small bowel / malabsorption
  'سلیاک', 'گلوتن‌انتروپاتی', 'سوءجذب', 'بیماری کرون', 'کولیت اولسراتیو',
  'بیماری‌های التهابی روده', 'انسداد روده', 'ایلیوس', 'ایسکمی مزانتریک',
  'سندرم روده کوتاه', 'رشد بیش از حد باکتری', 'باکتری رشد بیش از حد',

  // Colon / rectum
  'کولیت', 'کولیت پسودوممبرانو', 'کولیت ایسکمیک', 'دیورتیکولیت',
  'دیورتیکولوز', 'آپاندیسیت', 'هموروئید', 'شقاق آنال', 'آبسه پری‌آنال',
  'فیستول', 'پولیپ', 'پولیپ آدنوماتوز', 'پولیپوز', 'هماتوشزی', 'ملنا',
  'اسهال', 'یبوست', 'سندرم روده تحریک‌پذیر', 'اینسوسپشن', 'ولولوس',

  // Liver
  'هپاتیت', 'هپاتیت B', 'هپاتیت C', 'هپاتیت اتوایمیون', 'هپاتیت الکلی',
  'کبد چرب', 'استئاتوهپاتیت', 'سیروز', 'فیبروز کبدی', 'نارسایی حاد کبد',
  'انسفالوپاتی کبدی', 'آسیت', 'پریتونیت باکتریال خودبه‌خودی', 'بواسیر',
  'سندرم کبدی-کلیوی', 'کارسینوم هپاتوسلولار', 'هموکروماتوز',
  'بیماری ویلسون', 'کمبود آلفا-۱ آنتی‌تریپسین', 'کلستاز', 'یرقان',
  'هایپر بیلی‌روبینمی', 'سندرم باد-کیاری', 'ترومبوز ورید پورت',

  // Biliary / pancreas
  'سنگ کیسه صفرا', 'کوله‌سیستیت', 'کولانژیت', 'کلدوکولیتیازیس',
  'پانکراتیت', 'پانکراتیت حاد', 'پانکراتیت مزمن', 'نشت پانکراس',
  'کیست پانکراس', 'تومور پانکراس', 'آدنوکارسینوم پانکراس',

  // Bleeding / oncology / infection
  'خونریزی گوارشی', 'خونریزی گوارشی فوقانی', 'خونریزی گوارشی تحتانی',
  'خونریزی واریسی', 'پرفوراسیون', 'سوراخ‌شدگی', 'پریتونیت', 'سپسیس',
  'شوک هیپوولمیک', 'کولیک صفراوی', 'گاستروانتریت', 'مسمومیت غذایی',
  'اسهال مسافرتی', 'عفونت هلیکوباکتر پیلوری', 'کرم روده',
  'سندرم لینچ', 'سندرم پوتز-جگرز', 'پولیپوز آدنوماتوز خانوادگی',
  'کارسینوئید', 'لنفوم معده', 'تومور استرومال گوارشی',

  // Symptoms / signs
  'تهوع', 'استفراغ', 'هماتمز', 'دفع خون', 'درد شکم', 'نفخ', 'استوماتیت',
  'زخم دهان', 'آنمی فقر آهن', 'کاهش وزن', 'بی‌اشتهایی', 'ژنیکوماستی',
];

// اعداد همراه با واحد — ارقام فارسی و لاتین
const NUMBER_RE = /((?:[۰-۹]+|[0-9]+)(?:[.,][۰-۹0-9]+)?(?:\s*[-–]\s*(?:[۰-۹]+|[0-9]+)(?:[.,][۰-۹0-9]+)?)?\s*(?:روز|ساعت|سال|ماه|هفته|گرم|کیلوگرم|میلی‌گرم|گرم در دسی‌لیتر|g\/dL|mg\/dL|میکروگرم|میلی‌لیتر|لیتر|میلی‌مول|میکرومول|واحد|فیلد|فیلم|٪|%|cmH2O|mm Hg|mm|cm|kg\/m²|kg\/m2|U\/L|IU\/L|IU\/mL|mEq\/L|ng\/mL|pg\/mL|µg|μg|fL|pg|mg|IU|µL|μL|mL|L|g\/L|kg|kDa|kPa|copies\/mL|log))(?![0-9۰-۹])/g;

const WARNING_PHRASES = [
  'تهدیدکننده حیات',
  'تهدیدکننده زندگی',
  'ناسازگار با حیات',
  'مرگ‌ومیر بالا',
  'مورتالیتی بالا',
  'علت اصلی مرگ',
  'کشنده',
  'شدیدترین',
  'حاد و شدید',
  'بدخیم',
  'مقاوم به درمان',
  'شکست درمان',
  'پاسخ ناکافی',
  'عدم پاسخ',
  'منع مصرف',
  'نباید داده شود',
  'ممنوع است',
  'اجتناب شود',
  'مداخله فوری',
  'اورژانس پزشکی',
  'اورژانس جراحی',
  'نیاز به جراحی فوری',
  'انتقال به ICU',
  'خونریزی فعال',
  'خونریزی ماسیو',
  'پرفوراسیون',
  'سوراخ‌شدگی',
  'شوک سپتیک',
  'شوک هیپوولمیک',
  'نارسایی حاد کبد',
  'نارسایی ارگان',
  'انسداد کامل',
  'ایسکمی روده',
  'پیشرفت سریع',
  'بدتر شدن سریع',
  'بدون درمان قطعی',
  'درمان قطعی ندارد',
  'عوارض جدی',
  'پرخطر',
  'خطر بالا',
];

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Sort longest-first so nested terms work correctly.
const BOLD_SORTED = [...new Set(BOLD_TERMS)].sort((a, b) => b.length - a.length);
const HIGHLIGHT_SORTED = [...new Set(HIGHLIGHT_TERMS)].sort((a, b) => b.length - a.length);
const WARNING_SORTED = [...new Set(WARNING_PHRASES)].sort((a, b) => b.length - a.length);

// Latin word: must be surrounded by non-word chars (or line edges).
function latinBoundary(term) {
  const esc = escapeRegExp(term);
  const start = /^[A-Za-z0-9]/.test(term) ? '(?<![\\w\\*])' : '';
  const end = /[A-Za-z0-9]$/.test(term) ? '(?![\\w\\*])' : '';
  return new RegExp(`${start}${esc}${end}`, 'g');
}

// Persian phrase: not already wrapped by one of our markers.
function persianRegex(term) {
  const esc = escapeRegExp(term);
  return new RegExp(`(?<![=\\+@])(?<!\\*\\*)${esc}(?![=\\+@])(?!\\*\\*)`, 'g');
}

// ─────────────────────────────────────────────────────────────
// ENRICHMENT
// ─────────────────────────────────────────────────────────────

function applyBold(text) {
  if (!text || typeof text !== 'string') return text;
  let out = text;
  for (const term of BOLD_SORTED) {
    out = out.replace(latinBoundary(term), (match) => `**${match}**`);
  }
  return out;
}

function applyHighlight(text) {
  if (!text || typeof text !== 'string') return text;
  let out = text;
  for (const term of HIGHLIGHT_SORTED) {
    out = out.replace(persianRegex(term), (match) => `==${match}==`);
  }
  return out;
}

function applyWarning(text) {
  if (!text || typeof text !== 'string') return text;
  let out = text;
  for (const term of WARNING_SORTED) {
    out = out.replace(persianRegex(term), (match) => `@@${match}@@`);
  }
  return out;
}

function applyNumbers(text) {
  if (!text || typeof text !== 'string') return text;
  return text.replace(NUMBER_RE, (match) => `++${match.trim()}++`);
}

/**
 * Full enrichment pipeline for a single string field.
 * Order matters: bold → highlight → warning → numbers.
 */
function enrichString(text) {
  if (!text || typeof text !== 'string') return text;
  if (/^https?:\/\//.test(text)) return text;

  let out = text;

  out = applyBold(out);
  out = applyHighlight(out);
  out = applyWarning(out);
  out = applyNumbers(out);

  // Cleanup: collapse double markup, stray empties.
  out = out.replace(/(\*\*|==|\+\+|@@)\1+/g, '$1$1');
  out = out.replace(/\*\*\*\*/g, '');
  out = out.replace(/====/g, '');
  out = out.replace(/\+\+\+\+/g, '');
  out = out.replace(/@@@@/g, '');

  out = out.replace(/\*\*\s*\*\*/g, '');
  out = out.replace(/==\s*==/g, '');
  out = out.replace(/\+\+\s*\+\+/g, '');
  out = out.replace(/@@\s*@@/g, '');

  return out;
}

function enrichCard(card) {
  if (!card || typeof card !== 'object') return;
  const fields = ['title', 'content', 'question', 'answer', 'explanation', 'answerText'];
  for (const f of fields) {
    if (typeof card[f] === 'string') {
      card[f] = enrichString(card[f]);
    }
  }
  for (const f of ['options', 'columns', 'headers']) {
    if (Array.isArray(card[f])) {
      card[f] = card[f].map((c) => (typeof c === 'string' ? enrichString(c) : c));
    }
  }
  if (Array.isArray(card.rows)) {
    card.rows = card.rows.map((row) =>
      Array.isArray(row)
        ? row.map((cell) => (typeof cell === 'string' ? enrichString(cell) : cell))
        : row
    );
  }
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────

function main() {
  if (!fs.existsSync(SESSIONS_DIR)) {
    console.error(`❌ پوشه پیدا نشد: ${SESSIONS_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(SESSIONS_DIR)
    .filter((f) => f.endsWith('.json') && !f.startsWith('.'))
    .sort();

  console.log(`📂 ${files.length} فایل در ${SESSIONS_DIR}\n`);

  let totalCards = 0;
  let changedCards = 0;
  const summary = [];

  for (const file of files) {
    const full = path.join(SESSIONS_DIR, file);
    const raw = fs.readFileSync(full, 'utf8');

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error(`🔴 ${file}: JSON خراب است — ${e.message}`);
      continue;
    }

    const session = parsed.session ?? parsed;
    const sections = session.sections ?? [];

    let fileCards = 0;
    let fileChanged = 0;

    for (const sec of sections) {
      for (const card of sec.cards ?? []) {
        const before = JSON.stringify(card);
        enrichCard(card);
        const after = JSON.stringify(card);
        if (before !== after) fileChanged++;
        fileCards++;
      }
    }

    fs.writeFileSync(full, JSON.stringify(parsed, null, 2) + '\n', 'utf8');

    totalCards += fileCards;
    changedCards += fileChanged;
    summary.push({ 'فایل': file, 'کارت‌ها': fileCards, 'تغییر یافته': fileChanged });
    console.log(`  ✅ ${file.padEnd(22)} → ${String(fileChanged).padStart(3)} / ${fileCards}`);
  }

  console.log('');
  console.table(summary);
  console.log('');
  console.log(`🎉 کل: ${totalCards} کارت بررسی شد، ${changedCards} کارت تغییر کرد`);
  console.log('');
  console.log('💡 اگر نتیجه خوب نبود:');
  console.log('   rm -rf src/data/sessions && mv src/data/sessions.bak src/data/sessions');
}

main();
