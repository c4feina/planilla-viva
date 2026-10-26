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

export const metadata: Metadata = {
  title: {
    default: "Planilla Viva · IPM",
    template: "%s · Planilla Viva",
  },
  description:
    "Sistema interno de gestión académica del Profesorado de Educación Física del Instituto Privado de Merlo.",
  applicationName: "Planilla Viva",
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
