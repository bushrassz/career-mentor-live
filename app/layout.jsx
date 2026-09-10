export const metadata = {
  title: "مرشدك المهني",
  description: "اكتشف مجالات جديدة مناسبة لمهاراتك، طوّر مسارك الحالي، وحسّن سيرتك الذاتية.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
