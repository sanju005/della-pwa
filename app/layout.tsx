import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "DELLA",
  description: "Book trusted home and lifestyle services in one DELLA app.",
  applicationName: "DELLA",
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
  themeColor: "#16a34a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} h-full bg-[#f3fbf4] antialiased`}
    >
      <body className="min-h-full overflow-x-hidden bg-[#f3fbf4] text-[#0f172a]">
        {children}
      </body>
    </html>
  );
}
