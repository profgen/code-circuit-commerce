import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Code Circuit Commerce",
  description: "AI-first e-commerce bootstrap storefront",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        <header className="border-b">
          <nav className="mx-auto flex w-full max-w-6xl items-center gap-5 px-6 py-3">
            <Link href="/" className="font-semibold">
              Store
            </Link>
            <Link href="/category/electronics">Category</Link>
            <Link href="/cart">Cart</Link>
            <Link href="/checkout">Checkout</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
