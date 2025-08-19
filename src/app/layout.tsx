import type { Metadata } from "next";
import { Athiti } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const athti = Athiti({
  variable: "--font-mitr",
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "URL Shortener | MWIT-LINK",
  description: "MWIT-LINK URL Shortener Service",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${athti.className} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
