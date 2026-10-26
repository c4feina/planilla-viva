import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { initialAcademicState } from "@/lib/mock/data";
import { AcademicStoreProvider } from "@/lib/store/academic-store";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL !== undefined
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL !== undefined
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Planilla Viva · IPM",
    template: "%s · Planilla Viva",
  },
  description:
    "Demo del registro académico interno del Profesorado de Educación Física del Instituto Privado de Merlo.",
  applicationName: "Planilla Viva",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Planilla Viva",
    title: "Planilla Viva · Instituto Privado de Merlo",
    description:
      "Una sola planilla, compartida y que calcula sola. Demo con datos ficticios del Profesorado de Educación Física.",
    images: [
      {
        url: "/brand/hero-terciario.jpg",
        width: 640,
        height: 413,
        alt: "Profesorado de Educación Física del Instituto Privado de Merlo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Planilla Viva · Instituto Privado de Merlo",
    description: "Demo con datos ficticios del Profesorado de Educación Física.",
    images: ["/brand/hero-terciario.jpg"],
  },
  icons: {
    icon: "/brand/favicon.jpg",
    apple: "/brand/favicon.jpg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#6b1a1f" },
    { media: "(prefers-color-scheme: dark)", color: "#101214" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="es"
      className={`${sourceSans.variable} ${sourceSerif.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('planilla-viva-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d){document.documentElement.classList.add('dark');}}catch(e){}})();",
          }}
        />
      </head>
      <body>
        <AcademicStoreProvider initialState={initialAcademicState}>
          <AppShell>{children}</AppShell>
        </AcademicStoreProvider>
        <Analytics />
      </body>
    </html>
  );
}
