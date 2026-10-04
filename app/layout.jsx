import { Cairo, Amiri } from "next/font/google";

// next/font downloads these at build time and serves them from our own domain, so the browser
// never contacts fonts.googleapis.com / fonts.gstatic.com (which would expose visitor IPs).
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-cairo",
});

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-amiri",
});

export const metadata = {
  title: "مرشدك المهني",
  description: "اكتشف مجالات جديدة مناسبة لمهاراتك، طوّر مسارك الحالي، وحسّن سيرتك الذاتية.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${amiri.variable}`}>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
