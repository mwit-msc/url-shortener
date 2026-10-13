import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/session-provider";
import Footer from "@/components/footer";
import { PublicHeader } from "@/components/public-header";
import "./globals.css";

const outfit = localFont({
  src: "../../public/fonts/Outfit.ttf",
  variable: "--font-outfit",
  weight: "100 900",
  display: "swap",
});

const notoThai = localFont({
  src: "../../public/fonts/NotoSansThai.ttf",
  variable: "--font-noto-thai",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MWIT TINY - URL Shortener",
  description: "MWIT TINY ระบบย่อ URL โดยคณะกรรมการนักเรียนมัลติมีเดีย",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${notoThai.variable} antialiased`}
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <div className="app-frame min-h-screen flex flex-col">
              <PublicHeader />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster toastOptions={{ style: { background: "var(--popover)", color: "var(--foreground)", border: "1px solid var(--border)", borderRadius: "12px" } }} />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
