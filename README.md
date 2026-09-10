# مرشدك المهني (Career Skill Mentor)

تطبيق Next.js يحلّل السيرة الذاتية ويقترح مسارات مهنية باستخدام OpenRouter API.

## الإعداد

```bash
npm install
cp .env.local.example .env.local
```

عدّل `.env.local` وضع مفتاحك:

```
OPENROUTER_API_KEY=sk-or-v1-...
```

المفتاح يُستخدم فقط من طرف السيرفر عبر [app/api/mentor/route.js](app/api/mentor/route.js) ولا يصل للمتصفح إطلاقاً.

## التشغيل

```bash
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000).

## البنية

- [components/CareerSkillMentor.jsx](components/CareerSkillMentor.jsx) — واجهة المستخدم (client component).
- [app/api/mentor/route.js](app/api/mentor/route.js) — API route يستدعي OpenRouter بالمفتاح السري من متغيرات البيئة.
- [app/page.jsx](app/page.jsx), [app/layout.jsx](app/layout.jsx) — نقاط دخول Next.js App Router.
