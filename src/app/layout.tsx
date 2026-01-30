// استيراد أنواع البيانات والخطوط والأدوات من Next.js
// Import metadata, fonts, and utilities from Next.js
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// استيراد أداة التحليلات من Vercel
// Import Vercel Analytics
import { Analytics } from "@vercel/analytics/react";
// استيراد ملف الأنماط العام (CSS)
// Import global CSS styles
import "./globals.css";

// إعداد خط Geist Sans
// Setup Geist Sans font
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// إعداد خط Geist Mono (للكواد)
// Setup Geist Mono font
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// تعريف المعلومات الوصفية للموقع (Metadata)
// Define site metadata
export const metadata: Metadata = {
  title: "Dashboard - Client Management", // عنوان الموقع
  description: "Advanced dashboard for managing professional clients", // وصف الموقع
};

// استيراد مكون "الموفرين" (Providers) الذي يحتوي على السياقات (Contexts)
// Import Providers component which contains all context providers
import { Providers } from "@/components/providers";

// المكون الأساسي للتنسيق (Root Layout) الذي يغلف كل صفحات التطبيق
// Root Layout component that wraps all pages in the app
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* تغليف المحتوى بالموفرين لتمكين الوصول إلى البيانات والمصادقة */}
        {/* Wrap content with Providers to enable access to data and authentication */}
        <Providers> 
          {children}
          {/* إضافة أداة التحليلات */}
          {/* Add Analytics component */}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
