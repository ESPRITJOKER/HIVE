import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  title: { default: `${APP_NAME} — ${APP_TAGLINE}`, template: `%s · ${APP_NAME}` },
  description:
    "HIVE is a collaborative academic platform and AI-powered study assistant for university students.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: APP_NAME, statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#080817" },
    { media: "(prefers-color-scheme: light)", color: "#f5f4fa" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Trusted static bootstrap: applies the saved theme before first paint.
const themeBootstrap = `try{var t=localStorage.getItem('hive-theme');document.documentElement.dataset.theme=(t==='light'||t==='dark')?t:(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark')}catch(e){document.documentElement.dataset.theme='dark'}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className={`${inter.variable} ${manrope.variable} antialiased`}>
        <ThemeProvider>
          <QueryProvider>
            <div className="ambient-glow pointer-events-none fixed inset-x-0 top-0 -z-10 h-96" aria-hidden="true" />
            {children}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
