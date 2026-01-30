// التوسع في أنواع NextAuth لإضافة خصائص مخصصة للمستخدم
// Extend NextAuth types to add custom user properties
import "next-auth"

declare module "next-auth" {
  // إضافة خاصية isAdmin إلى كائن الجلسة (Session)
  // Add isAdmin property to the Session object
  interface Session {
    user: {
      name?: string | null
      email?: string | null
      image?: string | null
      isAdmin?: boolean // هل المستخدم مسؤول؟
    }
  }
}
