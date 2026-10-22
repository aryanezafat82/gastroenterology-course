# بریف فنی پلتفرم آموزشی — کورس گوارش

> **برای خوانندهٔ این سند:** این متن برای یک هوش مصنوعی مشاور نوشته شده که به کد پروژه دسترسی ندارد. هدف این است که پس از خواندن آن، تصویر کاملی از معماری، مدل داده، جریان‌های کاربر و محدودیت‌های پلتفرم داشته باشد و بتواند دربارهٔ تبدیل آن به یک سرویس مبتنی بر هوش مصنوعی (آپلود فایل درسی → تحویل دورهٔ طبقه‌بندی‌شده) نظر فنی بدهد.
>
> اگر فقط وقت خواندن یک بخش را دارید: **بخش ۱ (در یک نگاه)، بخش ۵ (مدل داده) و بخش ۱۳ (محدودیت‌ها)** را بخوانید.

---

## ۰. فهرست

1. در یک نگاه
2. مسئله و راه‌حل فعلی
3. پشتهٔ فناوری
4. ساختار پوشه‌ها
5. مدل داده
6. لایهٔ بارگذاری داده
7. وضعیت کاربر (State)
8. مسیریابی
9. جریان‌های کاربر
10. نقشهٔ کامپوننت‌ها
11. طراحی، تم و RTL
12. PWA، build و استقرار
13. محدودیت‌های معماری
14. شکاف‌ها برای تبدیل به پلتفرم آپلود + AI
15. فرایند ساخت یک دورهٔ جدید (وضعیت فعلی)
16. فهرست فایل‌های کلیدی
17. پرسش‌های باز برای مشاور

---

## ۱. در یک نگاه

| ویژگی | مقدار |
|---|---|
| نوع محصول | Single-Page Application (SPA) — یک دورهٔ آموزشی کارتی |
| موضوع نمونه | بیماری‌های گوارش و کبد (پزشکی، ترم فیزیوپات) |
| زبان / جهت | فارسی، RTL کامل |
| کاربر هدف | دانشجوی پزشکی، عمدتاً موبایل |
| تعداد فایل‌های سورس | ۶۸ فایل در `src/`، ۸۴ فایل در کل ریپو |
| حجم باندل production | JS ≈ ۳۷۲KB (gzip ۹۷KB) + CSS ≈ ۶۰KB (gzip ۱۰KB) |
| بک‌اند | **ندارد** — هیچ API، دیتابیس، احراز هویت یا آپلود |
| ذخیره‌سازی | فقط `localStorage` مرورگر |
| منبع محتوا | فایل‌های JSON که **در زمان build** داخل باندل کامپایل می‌شوند |
| تعداد دوره در هر build | **دقیقاً یکی** |
| وضعیت داده | خالی؛ فقط یک «جلسهٔ نمونه» ۸ کارتی برای تست ساختار |
| تست خودکار | ندارد |
| استقرار | GitHub Pages (استاتیک) |

---

## ۲. مسئله و راه‌حل فعلی

یک دورهٔ پزشکی معمولاً به‌صورت PDF و جزوهٔ چندصدصفحه‌ای تحویل داده می‌شود. این پلتفرم همان محتوا را به واحدهای کوچک (کارت) می‌شکند و حول آن ابزار یادگیری می‌سازد:

- مطالعهٔ مرحله‌به‌مرحله (جلسه → بخش → کارت)
- ثبت پیشرفت و ادامه از آخرین نقطه
- فلش‌کارت و تست چهارگزینه‌ای درون‌متنی
- نمونه سوالات ادوار گذشته، دسته‌بندی‌شده بر اساس موضوع و دورهٔ امتحان
- مرور فاصله‌دار (Spaced Repetition) روی کارت‌ها و سوالات
- علامت‌گذاری «نکات سخت» و یادداشت شخصی روی هر کارت/سوال
- تنظیم اندازهٔ فونت، حالت تاریک، نصب به‌صورت PWA و کار آفلاین

**نکتهٔ مهم:** محتوا هیچ‌وقت در زمان اجرا از سرور گرفته نمی‌شود؛ بخشی از کد است.

---

## ۳. پشتهٔ فناوری

| ابزار | نسخه | نقش |
|---|---|---|
| React | ^18.3 | UI |
| Vite | ^6.0 (نصب‌شده: 6.4.3) | build tool و dev server |
| JavaScript (ESM) | ES2022+ | بدون TypeScript |
| Tailwind CSS | ^4.0 با `@tailwindcss/vite` | استایل، توکن‌ها در `@theme` |
| React Router | ^6.28 — **HashRouter** | مسیریابی سمت کلاینت |
| lucide-react | ^0.469 | آیکون‌ها |
| Vazirmatn | Google Fonts | فونت فارسی |

بدون: TypeScript، Redux/Zustand، بک‌اند، دیتابیس، ORM، احراز هویت، UI kit، تست.

---

## ۴. ساختار پوشه‌ها

```
gastroenterology-course/
├── docs/
│   ├── ADDING-CONTENT.md        ← راهنمای افزودن جلسه/سوال
│   └── PLATFORM-BRIEF.md        ← همین سند
├── templates/
│   ├── session-TEMPLATE.json    ← قالب خالی جلسه
│   └── exam-TEMPLATE.json       ← قالب خالی آزمون
├── public/
│   ├── assets/favicon.svg
│   ├── manifest.webmanifest
│   └── sw.js
├── scripts/
│   ├── break-sentences.js       ← شکستن جمله‌ها به خطوط (ابزار محتوا)
│   └── enrich-json.js           ← افزودن bold/highlight/عدد/هشدار به JSON
├── src/
│   ├── components/              ← cards, common, layout, onboarding, questions, quiz, review
│   ├── context/                 ← ۹ Context
│   ├── data/                    ← course.json, sessions/, sample-questions/, loaders
│   ├── pages/                   ← ۱۱ صفحه
│   ├── router/AppRouter.jsx
│   ├── styles/index.css
│   ├── utils/                   ← reviewUtils.js, duplicateDetector.js
│   ├── App.jsx
│   └── main.jsx
├── .github/workflows/deploy.yml
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── PROJECT_SPEC.md              ← مشخصات فنی کامل (~۱۴۰۰ خط)
```

---

## ۵. مدل داده

مدل، سه‌سطحی و کاملاً ایستاست:

```
Course
 └── Session (جلسه)
      └── Section (بخش)
           └── Card (کارت)  → info | key_point | table | flashcard | quiz

Sample Questions (مستقل از دوره)
 └── Exam (دورهٔ امتحانی)
      └── Question → mcq | short_answer
```

### ۵.۱. `src/data/course.json` — فقط فهرست

```json
{
  "title": "بیماری‌های گوارش و کبد",
  "description": "دوره آموزشی بیماری‌های گوارش و کبد",
  "sessions": [
    { "id": "session-01", "title": "راهنمای ساختار (نمونه)", "file": "session-01.json" }
  ]
}
```

- `sessions` فقط **ترتیب و فهرست** را تعیین می‌کند؛ متن واقعی از فایل هر جلسه خوانده می‌شود.
- ترتیب نمایش = ترتیب آرایه، نه شمارهٔ فایل.

### ۵.۲. `src/data/sessions/session-XX.json`

```json
{
  "session": {
    "id": "session-01",
    "title": "عنوان جلسه",
    "shortTitle": "برچسب کوتاه (مثلاً نام استاد)",
    "description": "توضیح یک‌خطی",
    "sections": [
      {
        "id": "session-01-section-01",
        "title": "عنوان بخش",
        "description": "توضیح کوتاه بخش",
        "cards": [ /* ۵ نوع کارت */ ]
      }
    ]
  }
}
```

### ۵.۳. پنج نوع کارت

```json
// info / key_point
{ "id": "...", "type": "info", "title": "عنوان", "content": "متن.\n\nپاراگراف دوم." }

// table
{ "id": "...", "type": "table", "title": "جدول",
  "columns": ["ستون ۱", "ستون ۲"],
  "rows": [["a", "b"], ["c", "d"]] }

// flashcard
{ "id": "...", "type": "flashcard", "question": "پرسش؟", "answer": "پاسخ" }

// quiz
{ "id": "...", "type": "quiz", "question": "سؤال؟",
  "options": ["الف", "ب", "ج", "د"],
  "correctAnswer": 1,
  "explanation": "توضیح پاسخ" }
```

- `correctAnswer` **صفر-مبنا** است (۰ = گزینهٔ اول).
- کارت `quiz` تا پاسخ داده نشود، اجازهٔ عبور به کارت بعد را نمی‌دهد.

**نشانه‌گذاری متن** (در همهٔ فیلدهای متنی، با کامپوننت `RichText` رندر می‌شود):

| نشانه | نتیجه |
|---|---|
| `**متن**` | پررنگ (اصطلاح لاتین/دارو/تست) |
| `==متن==` | هایلایت (بیماری/سندرم فارسی) |
| `++متن++` | سبز (اعداد و مقادیر) |
| `@@متن@@` | هشدار |

### ۵.۴. نمونه سوالات

`sample-questions/index.json` — فهرست دوره‌های امتحانی:

```json
{
  "title": "نمونه سوالات",
  "description": "سوالات امتحانی ادوار گذشته",
  "exams": [
    { "id": "bahman-1401", "label": "بهمن ۱۴۰۱", "file": "bahman-1401.json", "questionCount": 20 }
  ]
}
```

`sample-questions/bahman-1401.json`:

```json
{
  "exam": {
    "id": "bahman-1401",
    "label": "بهمن ۱۴۰۱",
    "sourceFile": "نام فایل منبع.txt",
    "questionCount": 20,
    "questions": [
      {
        "id": "bahman-1401-q-01",
        "type": "mcq",
        "topic": "liver",
        "sessionId": "unknown",
        "question": "متن سؤال؟",
        "options": ["گزینه ۱", "گزینه ۲", "گزینه ۳", "گزینه ۴"],
        "correctAnswer": 0,
        "explanation": "توضیح"
      },
      {
        "id": "bahman-1401-q-02",
        "type": "short_answer",
        "topic": "ibd",
        "question": "سؤال کوتاه‌پاسخ؟",
        "answerText": "پاسخ کوتاه"
      }
    ]
  }
}
```

`sample-questions/topics.json` — طبقه‌بندی موضوعی مستقل از جلسات:

```json
{
  "title": "موضوعات",
  "topics": [
    { "id": "esophagus", "label": "مری" },
    { "id": "stomach-duodenum", "label": "معده و دوازدهه" },
    { "id": "liver", "label": "کبد" }
  ]
}
```

- سوال بدون `topic` در سبد `unknown` می‌افتد و در UI بخش «سوالات بدون دسته» نمایش داده می‌شود.
- `sessionId` قدیمی و صرفاً برای نمایش برچسب است؛ طبقه‌بندی اصلی با `topic` انجام می‌شود.

### ۵.۵. قواعد شناسه (ID) — قرارداد سخت

```
session:  session-01
section:  session-01-section-01
card:     session-01-section-01-card-01
question: bahman-1401-q-01
topic:    liver          (انگلیسی، یکتا، kebab-case)
exam:     bahman-1401
```

`card.id` کلید ذخیرهٔ پیشرفت، مرور، نکات سخت و یادداشت کاربر است. تغییر یا حذف آن باعث «یتیم شدن» دادهٔ کاربر می‌شود؛ بنابراین IDها فقط افزودنی‌اند، نه تغییرپذیر.

### ۵.۶. فایل‌های داده‌ای فعلی

```
src/data/course.json                     ← ۱ جلسه (نمونه)
src/data/sessions/session-01.json        ← ۲ بخش، ۸ کارت (فقط نمایش ساختار)
src/data/sample-questions/index.json     ← خالی: "exams": []
src/data/sample-questions/topics.json    ← ۱۲ موضوع گوارشی، بدون سوال
```

---

## ۶. لایهٔ بارگذاری داده

`src/data/loaders.js` و `src/data/sampleQuestionsLoader.js` — بدون fetch، بدون async:

```js
const sessionModules = import.meta.glob('./sessions/*.json', { eager: true });

export function getSessionData(sessionId) {
  const meta = getSessionMeta(sessionId);       // از course.json
  if (!meta) return null;
  const mod = sessionModules[`./sessions/${meta.file}`];
  return mod?.default?.session ?? mod?.default ?? null;
}
```

پیامدهای معماری این انتخاب:

1. **همهٔ محتوا در باندل است.** با ۱۶ جلسه و چند هزار کارت، باندل بزرگ می‌شود و کل دوره با اولین بازدید دانلود می‌شود.
2. **افزودن فایل JSON نیاز به ری‌استارت dev server دارد** (glob کش می‌شود).
3. **محتوا در زمان build قفل می‌شود**؛ تغییر محتوا = build و deploy مجدد.
4. **یک build = یک دوره.** برای دو دوره، دو باندل جدا.

---

## ۷. وضعیت کاربر (State)

۹ Context تودرتو در `main.jsx` (ترتیب importance دارد):

```
Onboarding → Theme → FontScale → SamplePreferences
→ Notes → Progress → HardPoints → Review → App
```

همهٔ state کاربر در `localStorage` با پیشوند `gi-` ذخیره می‌شود (پیشوند دورهٔ غدد `endo-` است تا دو محصول روی یک دامنه تداخل نکنند):

| کلید | شکل داده | چه چیزی نگه می‌دارد |
|---|---|---|
| `gi-progress` | `{ completedSections: ["session-01/section-01"], lastStudied: { sessionId, sectionId } \| null }` | بخش‌های تکمیل‌شده + آخرین نقطهٔ مطالعه |
| `gi-review` | map با کلید `session/section/card` یا `__q__/exam/question` → `{ kind, status, nextReviewAt, interval, reviewCount, lastReviewedAt, ... }` | صف مرور فاصله‌دار |
| `gi-hard-points` | map با همان دو فرم کلید → `{ kind, ...ids }` | کارت/سوال علامت‌خورده |
| `gi-notes` | map کلید → رشته | یادداشت شخصی |
| `gi-theme` | `"light" \| "dark"` | تم |
| `gi-font-scale` | ایندکس ۰..۳ → مقیاس ۰.۸۵ / ۱.۰ / ۱.۱۵ / ۱.۳ | اندازهٔ فونت |
| `gi-sample-show-answers` | `"true" \| "false"` | نمایش پیش‌فرض پاسخ سوالات |
| `gi-onboarding` | `{ "welcome-tour": true, "sample-questions-guide": true }` | آموزش‌های دیده‌شده |

**الگوریتم مرور:** فواصل ثابت `[۱، ۳، ۷، ۱۴، ۳۰]` روز. رتبه‌بندی سه‌گانه:

- `forgot` (یادم نبود) → بازگشت به فاصلهٔ ۱ روز
- `partial` (تا حدی) → یک پله جلو
- `easy` (کاملاً) → دو پله جلو

هیچ‌کدام از این داده‌ها به سرور نمی‌رود؛ با پاک کردن مرورگر از بین می‌رود (مهاجرت بین دستگاه‌ها وجود ندارد).

---

## ۸. مسیریابی

`HashRouter` (برای سازگاری با GitHub Pages، بدون نیاز به rewrite سمت سرور):

| مسیر | صفحه | کار |
|---|---|---|
| `/` | Home | عنوان دوره، پیشرفت کلی، ادامهٔ مطالعه، مرور امروز، نکات سخت، سوالات |
| `/sessions` | Sessions | فهرست جلسات + درصد پیشرفت هر جلسه |
| `/session/:sessionId` | Session | بخش‌های یک جلسه |
| `/session/:sessionId/section/:sectionId` | Section | **موتور اصلی مطالعه** — کارت‌به‌کارت |
| `/hard-points` | HardPoints | تب کارت / سوال |
| `/progress` | Progress | آمار کلی |
| `/review` | Review | تب کارت / سوال + مرور امروز |
| `/sample-questions` | SampleQuestions | موضوعات + دوره‌های امتحانی |
| `/sample-questions/topic/:topicId` | SampleTopic | سوالات یک موضوع از همهٔ دوره‌ها |
| `/sample-questions/exam/:examId` | SampleExam | سوالات یک دورهٔ امتحانی |
| `*` | NotFound | — |

---

## ۹. جریان‌های کاربر

### ۹.۱. مطالعهٔ یک بخش (`Section.jsx`)
- یک کارت در هر لحظه؛ ناوبری با دکمه یا **swipe** (راست = بعدی، چون RTL).
- نوار پیشرفت کارت‌ها، شمارهٔ کارت، عنوان بخش.
- ابزارهای هر کارت: «سخت بود»، «مرور»، «یادداشت».
- کارت `quiz`: انتخاب گزینه → تأیید → بازخورد رنگی + توضیح؛ بدون پاسخ، `canProceed=false`.
- آخرین کارت → «تکمیل بخش» → ثبت در `gi-progress` و رفتن به بخش بعد.
- آموزش swipe فقط بار اول (Onboarding).

### ۹.۲. مرور (`Review.jsx`)
- دو تب: کارت‌ها و سوالات.
- موارد سررسیده بر اساس `nextReviewAt`؛ نمایش کارت/سوال + سه دکمهٔ رتبه‌بندی.
- خلاصهٔ پایان جلسهٔ مرور (چند مورد، چند درست).

### ۹.۳. نمونه سوالات
- دو محور ورود: موضوع (`topics.json`) و دورهٔ امتحان (`exams`).
- حالت مطالعه: می‌توان پاسخ را از قبل نشان داد (تنظیم `gi-sample-show-answers`).
- برچسب «تکراری» برای سوالات مشابه (تشخیص با `duplicateDetector.js`).

### ۹.۴. پیشرفت
- درصد کل، تعداد بخش‌های تکمیل‌شده، جلسات کامل‌شده، وضعیت مرور.

---

## ۱۰. نقشهٔ کامپوننت‌ها

```
App → AppRouter → AppLayout
                     ├── Sidebar (دسکتاپ) / Header (موبایل) / BottomNav
                     ├── Outlet → صفحات
                     ├── WelcomeTour (بار اول)
                     └── InstallPrompt (PWA)

Section.jsx
 └── SectionSessionProvider (key=sectionId، state موقت کارت‌ها/آزمون)
      └── CardRenderer → CardWrapper → InfoCard | KeyPointCard | TableCard | Flashcard | QuizCard

SampleQuestions → QuestionCard (RichText + NoteEditor + FontSizeControl)
Review         → ReviewCard / ReviewRating / ReviewSummary / ReviewGuide
```

اجزای مشترک: `Button` (۵ variant)، `ProgressBar`، `EmptyState`، `Loading`، `RichText`، `NoteEditor`، `FontSizeControl`، `ThemeToggle`، `CardTransition`.

---

## ۱۱. طراحی، تم و RTL

- رنگ اصلی: `rose-600` = `#e11d48` (در `@theme` به‌عنوان `--color-primary`).
- رنگ‌های معنایی: sky = اطلاعات، amber = نکته/سخت، violet = جدول، emerald = پاسخ درست/اعداد، indigo = مرور/یادداشت، cyan = نمونه سوالات.
- فونت Vazirmatn؛ `line-height: 1.9` برای پاراگراف‌ها.
- `dir="rtl"` و `lang="fa"` روی `<html>`.
- مقیاس فونت کارت با `em` و متغیر `--font-scale` (۰.۸۵ تا ۱.۳) تا نسبت‌ها حفظ شود.
- انیمیشن‌ها: `card-in`، `pop-in`، `shake`، `fade-in`، `expand-down`، `swipe-hint-*` — همه با `prefers-reduced-motion` سازگار.
- موبایل: `touch-action: manipulation`، `overflow-x-hidden`، `break-words`.

---

## ۱۲. PWA، build و استقرار

- `public/sw.js`: pass-through ساده (بدون کش تهاجمی) + `skipWaiting`/`clients.claim`.
- `manifest.webmanifest` با `start_url`/`scope` = `/gastroenterology-course/`.
- `vite.config.js`: `base: '/gastroenterology-course/'` — مسیر ثابت در همهٔ URLها و PWA استفاده می‌شود.
- `npm run dev` → `http://localhost:5173/gastroenterology-course/`
- `npm run build` → `dist/`
- `.github/workflows/deploy.yml`: build + `cp dist/index.html dist/404.html` + `actions/deploy-pages`.

---

## ۱۳. محدودیت‌های معماری (برای هر بازطراحی حیاتی است)

1. **بدون بک‌اند.** هیچ سروری برای آپلود، پردازش، احراز هویت یا ذخیره‌سازی وجود ندارد.
2. **محتوا در باندل کامپایل می‌شود.** داده در زمان اجرا قابل تغییر نیست؛ build مجدد لازم است.
3. **یک build = یک دوره.** چنددوره‌ای بودن، امروز فقط با چند استقرار جدا انجام می‌شود.
4. **بدون احراز هویت و بدون مالکیت داده.** هر مرورگر یک کاربر مستقل است؛ state با پاک شدن مرورگر می‌رود.
5. **state کاربر روی سرور نیست.** هیچ همگام‌سازی بین دستگاه‌ها وجود ندارد.
6. **`base` مسیر هاردکد شده.** هر تغییر مسیر استقرار، سه جا را هم‌زمان تغییر می‌دهد (`vite.config.js`، `index.html`/manifest، ثبت service worker).
7. **IDها تغییرناپذیرند.** هر ابزار تولید محتوا باید ID پایدار بسازد و هرگز تغییر ندهد.
8. **`sessionId`های سوالات ممکن است `unknown` باشند.** طبقه‌بندی واقعی روی `topic` است، نه جلسه.
9. **بدون تست خودکار.** صحت محتوا (اعداد، دوزها، معیارها) هیچ سد فنی ندارد؛ فقط بازبینی انسانی.
10. **باندل تک‌فایل بزرگ.** با محتوای واقعی (هزاران کارت) حجم JS به‌سرعت چند مگابایت می‌شود؛ راهکار فعلی تقسیم کد (code splitting) ندارد.
11. **`import.meta.glob` کش می‌کند.** افزودن JSON بدون ری‌استارت dev server دیده نمی‌شود.
12. **بدون i18n.** همهٔ رشته‌های UI فارسی و داخل کامپوننت‌ها هستند (بدون فایل ترجمه).

---

## ۱۴. شکاف‌ها برای تبدیل به «پلتفرم آپلود فایل + هوش مصنوعی»

این فهرست عمداً فقط **شکاف** است، نه راه‌حل؛ برای این‌که مشاور مستقل بتواند پیشنهاد بدهد.

### الف) شکاف محصولی
- مسیر «آپلود فایل» وجود ندارد؛ کاربر امروز فقط مصرف‌کنندهٔ محتوای از پیش ساخته است.
- هیچ ابزار تولید محتوایی در ریپو نیست؛ ساخت دوره امروز دستی است (بخش ۱۵).
- هیچ پنل مدیریت/بازبینی محتوا وجود ندارد.
- چنددوره‌ای بودن، اشتراک، پرداخت و دعوت کاربر وجود ندارد.

### ب) شکاف داده‌ای
- داده در باندل است، نه در دیتابیس؛ برای چنددوره‌ای شدن باید منبع داده از build-time به runtime منتقل شود.
- هیچ نگاشت «کارت → منبع» (صفحه/فایل/بازهٔ متنی) وجود ندارد؛ بدون آن، ردیابی و بازبینی محتوای تولیدشده توسط AI ممکن نیست.
- هیچ فیلد «وضعیت بازبینی» (draft/reviewed/published) در اسکیما نیست.
- غنی‌سازی متن (`enrich-json.js`) با لیست واژه‌های ثابت کار می‌کند، نه با استخراج معنایی.

### ج) شکاف فنی
- نبود سرور/صف پردازش برای استخراج PDF، OCR، chunking و فراخوانی مدل.
- نبود احراز هویت و جداسازی دادهٔ کاربران (multi-tenancy).
- نبود مکانیزم اعتبارسنجی اسکیمای JSON پیش از انتشار (فقط build می‌شکند یا صفحه خالی می‌شود).
- نبود جریان «پیش‌نمایش قبل از انتشار» و «نسخه‌بندی دوره».
- نبود crash reporting / analytics برای سنجش کیفیت تجربه.

### د) شکاف کیفیتی (مهم‌ترین)
- هیچ سد فنی برای خطای محتوایی وجود ندارد؛ در محتوای پزشکی، یک عدد غلط هزینهٔ واقعی دارد.
- هیچ مکانیزم «ارجاع به منبع» در UI نیست (فقط در اسکیمای پیشنهادی `sourceFile` برای آزمون‌ها وجود دارد).

---

## ۱۵. فرایند ساخت یک دورهٔ جدید (وضعیت فعلی — کاملاً دستی)

1. PDF/جزوهٔ درس خوانده می‌شود و به سرفصل تقسیم می‌شود.
2. برای هر جلسه یک `session-XX.json` نوشته می‌شود (با قالب `templates/`).
3. هر بخش ۵ تا ۱۵ کارت می‌گیرد؛ ترکیب پیشنهادی: متن، نکته، جدول، فلش‌کارت، تست.
4. رکورد جلسه در `course.json` اضافه می‌شود.
5. `scripts/enrich-json.js` نشانه‌گذاری را اضافه می‌کند (اختیاری، با بکاپ).
6. سوالات ادوار در `sample-questions/[examId].json` و فهرستش در `index.json`.
7. `npm run build` → استقرار.

زمان تقریبی فعلی برای یک جلسهٔ ۴۰ کارتی: چند ساعت کار انسانی (نوشتن، بازبینی، نشانه‌گذاری).

---

## ۱۶. فهرست فایل‌های کلیدی

| فایل | نقش |
|---|---|
| `src/data/course.json` | فهرست جلسات |
| `src/data/sessions/*.json` | محتوای جلسات (بخش‌ها و کارت‌ها) |
| `src/data/sample-questions/index.json` | فهرست دوره‌های امتحانی |
| `src/data/sample-questions/topics.json` | طبقه‌بندی موضوعی سوالات |
| `src/data/loaders.js` | خواندن داده از glob |
| `src/data/sampleQuestionsLoader.js` | پرس‌وجوهای سوالات (موضوع، دوره، تکرار) |
| `src/context/ProgressContext.jsx` | پیشرفت و ادامهٔ مطالعه |
| `src/context/ReviewContext.jsx` | صف مرور + رتبه‌بندی |
| `src/context/HardPointsContext.jsx` | نکات سخت |
| `src/context/NotesContext.jsx` | یادداشت |
| `src/pages/Section.jsx` | موتور مطالعهٔ کارت‌به‌کارت |
| `src/pages/SampleQuestions.jsx` | ورودی سوالات (موضوع/دوره) |
| `src/components/cards/*` | پنج نوع کارت |
| `src/components/common/RichText.jsx` | رندر نشانه‌گذاری متن |
| `src/utils/reviewUtils.js` | الگوریتم فواصل مرور |
| `docs/ADDING-CONTENT.md` | راهنمای عملی افزودن محتوا |
| `PROJECT_SPEC.md` | مشخصات فنی کامل (۱۴۲۸ خط) |

---

## ۱۷. پرسش‌های باز (اختیاری — اگر مشاور بخواهد دقیق‌تر کمک کند)

1. برای MVP، معماری «یک build به‌ازای هر دوره» کافی است یا از ابتدا باید داده در runtime از دیتابیس خوانده شود؟
2. حداقل اسکیمای لازم برای نگاشت «کارت → منبع» (فایل، صفحه، بازهٔ متنی) چیست تا بازبینی انسانی معنی‌دار شود؟
3. کدام بخش از خط تولید (استخراج، سرفصل‌بندی، تولید کارت، تولید سوال) را باید اول خودکار کرد و کدام را باید دستی نگه داشت؟
4. با چه معیارهایی می‌توان کیفیت محتوای تولیدشده را قبل از انتشار سنجید (و نه بعد از شکایت دانشجو)؟
5. آیا سطح فعلی جداسازی state (localStorage با پیشوند دوره) برای مدل «هر کاربر، چند دوره» کافی است یا باید از ابتدا سرورمحور طراحی شود؟
