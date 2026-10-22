# افزودن محتوا به کورس گوارش

این پروژه با **داده‌ی خالی** تحویل داده شده است: یک جلسه‌ی نمونه (برای نمایش ساختار) و فهرست نمونه‌سوالات خالی.
محتوای واقعی را طبق مراحل زیر اضافه کنید.

---

## ۱. ساختار داده

```
src/data/
├── course.json                  ← فهرست جلسات (id، title، file)
├── sessions/
│   └── session-XX.json          ← محتوای هر جلسه (بخش‌ها و کارت‌ها)
└── sample-questions/
    ├── index.json               ← فهرست دوره‌های امتحانی
    ├── topics.json              ← فهرست موضوعات سوالات
    └── [examId].json            ← سوالات هر دوره امتحانی
```

فایل‌های آماده در پوشه‌ی `templates/`:

- `templates/session-TEMPLATE.json`
- `templates/exam-TEMPLATE.json`

---

## ۲. افزودن جلسه

1. یک کپی از `templates/session-TEMPLATE.json` بسازید و در `src/data/sessions/` با نام `session-02.json` (و بعدی‌ها) ذخیره کنید.
2. `session.id` را با نام فایل یکی کنید: `session-02`.
3. شناسه‌ها را با همان پیشوند بنویسید:
   - بخش: `session-02-section-01`
   - کارت: `session-02-section-01-card-01`
4. در `src/data/course.json` یک رکورد اضافه کنید:

```json
{ "id": "session-02", "title": "عنوان جلسه", "file": "session-02.json" }
```

5. سرور توسعه را یک بار ری‌استارت کنید (`Ctrl+C` و دوباره `npm run dev`).
   دلیل: Vite فایل‌های JSON را در زمان build با `import.meta.glob` می‌شناسد و کش می‌کند.

> ترتیب نمایش جلسات در برنامه، همان ترتیب آرایه‌ی `sessions` در `course.json` است — نه شماره‌ی فایل.

---

## ۳. انواع کارت

| نوع | فیلدها |
|---|---|
| `info` | `title`, `content` |
| `key_point` | `title`, `content` |
| `table` | `title`, `columns` (آرایه), `rows` (آرایه‌ی آرایه) |
| `flashcard` | `question`, `answer` |
| `quiz` | `question`, `options`, `correctAnswer` (**صفر-مبنا**), `explanation` |

### نشانه‌گذاری متن

در همه‌ی فیلدهای متنی:

| نشانه | نتیجه |
|---|---|
| `**متن**` | پررنگ |
| `==متن==` | هایلایت |
| `++متن++` | سبز (اعداد و مقادیر) |
| `@@متن@@` | هشدار (قرمز/کهربایی) |

هر خط جدید را با `\n` بنویسید. اگر `\n` نگذارید، متن یک پاراگراف پیوسته می‌شود.

---

## ۴. افزودن نمونه سوال

1. کپی `templates/exam-TEMPLATE.json` را با نام `bahman-1402.json` در `src/data/sample-questions/` ذخیره کنید.
2. `exam.id` را با نام فایل یکی کنید (`bahman-1402`) و شناسه‌ی سوال‌ها را `bahman-1402-q-01` به بعد بگذارید.
3. `topic` هر سوال را از `src/data/sample-questions/topics.json` انتخاب کنید (مثلاً `liver`، `ibd`، `pancreas`).
   اگر موضوع مشخصی ندارد، فیلد را حذف کنید یا `unknown` بگذارید تا در بخش «سوالات بدون دسته» بیاید.
4. در `index.json` رکورد اضافه کنید:

```json
{ "id": "bahman-1402", "label": "بهمن ۱۴۰۲", "file": "bahman-1402.json", "questionCount": 40 }
```

5. سرور را ری‌استارت کنید.

### افزودن موضوع جدید

در `topics.json` یک آیتم اضافه کنید؛ `id` انگلیسی و یکتا، `label` فارسی:

```json
{ "id": "nutrition", "label": "تغذیه و ویتامین‌ها" }
```

---

## ۵. قواعد طلایی

- ✅ `id`ها را از آخر اضافه کنید؛ `id`های موجود را تغییر ندهید و حذف نکنید.
- ❌ `session-01` را به نام دیگری تغییر ندهید؛ داده‌ی کاربران (پیشرفت، مرور، یادداشت) یتیم می‌شود.
- ❌ `card.id` را بعد از انتشار تغییر ندهید.
- ✅ برای ویرایش محتوا، همان کارت را ویرایش کنید؛ کارت را حذف و از نو نسازید.
- ✅ قبل از اجرای `scripts/enrich-json.js` از `src/data/sessions` بکاپ بگیرید (اسکریپت فایل‌ها را بازنویسی می‌کند).

---

## ۶. دستورها

```bash
npm install       # نصب وابستگی‌ها
npm run dev       # اجرای محلی (http://localhost:5173/gastroenterology-course/)
npm run build     # خروجی production در dist/
npm run preview   # پیش‌نمایش خروجی build
```

مسیر `base` در `vite.config.js` روی `/gastroenterology-course/` تنظیم شده است (برای GitHub Pages).
اگر نام ریپو را عوض کردید، این مقدار و مسیرهای `public/manifest.webmanifest` را هم به‌روز کنید.

---

## ۷. وضعیت فعلی این نسخه

- [x] کد کامل برنامه (کارت‌ها، آزمون، مرور، نکات سخت، یادداشت، PWA، حالت تاریک، RTL)
- [x] هویت بصری و متنی روی «گوارش» تنظیم شده
- [x] کلیدهای `localStorage` با پیشوند `gi-` (جدا از پروژه‌ی غدد)
- [ ] جلسات واقعی (`src/data/sessions/`)
- [ ] نمونه سوالات واقعی (`src/data/sample-questions/`)
- [ ] فایل جلسه‌ی نمونه (`session-01.json`) را بعد از افزودن محتوای واقعی حذف کنید
