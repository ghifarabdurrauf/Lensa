import "../globals.css";
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { AppProvider } from "@/components/AppProvider";
import { Shell } from "@/components/Shell";
import { DICTS } from "@/lib/i18n";
import { LOCALES, type Locale } from "@/lib/types";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = DICTS[(LOCALES.includes(locale as Locale) ? locale : "id") as Locale];
  return {
    title: { default: "Lensa", template: "%s · Lensa" },
    description: t.app.tagline,
    icons: { icon: "/icon.svg", apple: "/icon.svg" },
    robots: { index: false, follow: false },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ECEAE5" },
    { media: "(prefers-color-scheme: dark)", color: "#16191C" },
  ],
};

/* Dipasang sebelum halaman tampil, supaya tidak ada kedipan tema terang ke gelap. */
const themeScript = `(function(){try{var p=JSON.parse(localStorage.getItem('lensa-prefs')||'{}');var m=p.mode||'auto';var pal=p.palette||'sage';var d=m==='dark'||(m==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches)||pal==='stone';var e=document.documentElement;e.dataset.theme=d?'dark':'light';e.dataset.palette=pal==='stone'?'sage':pal;}catch(_){}})();`;

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!LOCALES.includes(locale as Locale)) notFound();
  return (
    <html lang={locale} data-theme="light" data-palette="sage" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <AppProvider locale={locale as Locale}>
          <Shell>{children}</Shell>
        </AppProvider>
      </body>
    </html>
  );
}
