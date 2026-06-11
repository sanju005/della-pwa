import type { Metadata, Viewport } from "next";
import "./globals.css";
import {
  getAppBaseUrl,
  getSupabasePublishableKey,
  getSupabaseUrl,
} from "@/lib/supabase-env";

export const metadata: Metadata = {
  title: "DELLA",
  description: "Book trusted home and lifestyle services in one DELLA app.",
  applicationName: "DELLA",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
    shortcut: "/icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DELLA",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#645394",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publicRuntimeConfig = {
    supabaseUrl: getSupabaseUrl(),
    supabasePublishableKey: getSupabasePublishableKey(),
    appBaseUrl: getAppBaseUrl(),
  };

  return (
    <html lang="en" className="h-full bg-[#f5f1fb] antialiased">
      <body className="min-h-full overflow-x-hidden bg-[#f5f1fb] text-[#0f172a]">
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__DELLA_PUBLIC_CONFIG = ${JSON.stringify(publicRuntimeConfig)};`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
