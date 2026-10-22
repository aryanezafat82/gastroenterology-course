# کورس گوارش — Gastroenterology Course

پلتفرم آموزشی پزشکی تحت وب برای دورهٔ «بیماری‌های گوارش و کبد»: میکرولرنینگ کارتی، نمونه سوالات ادوار گذشته، مرور فاصله‌دار، یادداشت شخصی، نکات سخت، تنظیم فونت، حالت تاریک، PWA و پشتیبانی کامل RTL فارسی.

این پروژه از نظر معماری همان پروژهٔ کورس غدد است و فقط هویت، مسیرها و داده‌هایش برای گوارش خالی/جدا شده است.

## شروع سریع

```bash
npm install
npm run dev
```

آدرس محلی: `http://localhost:5173/gastroenterology-course/`

```bash
npm run build     # خروجی production در dist/
npm run preview   # پیش‌نمایش build
```

## ساختار

```
src/
├── components/   کارت‌ها، سوالات، آزمون، مرور، onboarding، layout
├── context/      ۹ Context (Progress, HardPoints, Review, Notes, Theme, FontScale, ...)
├── data/         course.json + sessions/ + sample-questions/
├── pages/        صفحه‌های برنامه
├── router/       HashRouter
└── styles/       Tailwind + توکن‌های رنگ
docs/ADDING-CONTENT.md   ← راهنمای افزودن جلسه و سوال
templates/               ← قالب JSON جلسه و آزمون
PROJECT_SPEC.md          ← مشخصات کامل فنی
```

## وضعیت داده

داده‌های آموزشی خالی است. یک جلسهٔ نمونه («راهنمای ساختار») فقط برای نمایش انواع کارت و تست مسیرها ثبت شده است؛ بعد از افزودن محتوای واقعی آن را حذف کنید.

- کلیدهای `localStorage` با پیشوند `gi-` هستند و با پروژهٔ غدد تداخل ندارند.
- `base` در `vite.config.js` روی `/gastroenterology-course/` تنظیم شده است.

## مجوز و اعتبار

ساختهٔ Arya Nezafat — دانشگاه علوم پزشکی گیلان.
