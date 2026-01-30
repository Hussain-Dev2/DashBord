
// استيراد أنواع البيانات لإعدادات NextAuth
// Import types for NextAuth configuration
import { NextAuthOptions } from "next-auth"
// استيراد موفر خدمة جوجل لتسجيل الدخول
// Import Google provider for authentication
import GoogleProvider from "next-auth/providers/google"

// استيراد قائمة البريد الإلكتروني للمسؤولين
// Import the list of admin emails
import { ADMIN_EMAILS } from "./constants"

// إعدادات مصادقة NextAuth
// Configuration for NextAuth authentication
export const authOptions: NextAuthOptions = {
  providers: [
    // إعداد الدخول عبر جوجل باستخدام المعرف والسر من ملف البيئة
    // Setup Google login using Client ID and Secret from environment variables
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  // المفتاح السري لتشفير الجلسات
  // Secret key for encrypting sessions
  secret: process.env.NEXTAUTH_SECRET || "secret",
  // تفعيل وضع التصحيح في بيئة التطوير
  // Enable debug mode in development environment
  debug: process.env.NODE_ENV === 'development',
  // تحديد صفحات مخصصة (مثل صفحة تسجيل الدخول)
  // Define custom pages (like the login page)
  pages: {
    signIn: '/login',
  },
  // وظائف الاستدعاء (Callbacks) للتحكم في الجلسة والمستخدم
  // Callbacks to control session and user behavior
  callbacks: {
    async session({ session }) {
      // التحقق مما إذا كان المستخدم مسجلاً وله بريد إلكتروني
      // Check if the user is logged in and has an email
      if (session.user?.email) {
        // التحقق مما إذا كان البريد الإلكتروني للمستخدم موجوداً في قائمة المسؤولين
        // Check if the user's email is in the admin emails list
        session.user.isAdmin = ADMIN_EMAILS.some(
          email => email.toLowerCase() === session.user?.email?.toLowerCase()
        )
      }
      return session
    },
  },
}
