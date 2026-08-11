import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | FC Upgrade Intelligence",
    default: "FC Upgrade Intelligence",
  },
  description:
    "Nền tảng phân tích dữ liệu cầu thủ FC Online. Tối ưu hóa nâng cấp, phân tích bait/dây mồi, dự đoán cầu thủ với AI.",
  keywords: [
    "FC Online",
    "FO4",
    "FC4",
    "nâng cấp cầu thủ",
    "player upgrade",
    "football analytics",
    "FC upgrade",
    "bait analysis",
  ],
  authors: [{ name: "FC Upgrade Intelligence" }],
  openGraph: {
    type: "website",
    siteName: "FC Upgrade Intelligence",
    title: "FC Upgrade Intelligence",
    description: "Nền tảng phân tích và tối ưu hóa nâng cấp cầu thủ FC Online.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
