import { redirect } from 'next/navigation'

// الصفحة الرئيسية تقوم فقط بتحويل المستخدم تلقائياً إلى لوحة التحكم
// The Home page simply redirects the user automatically to the admin dashboard
export default function Home() {
  redirect('/admin')
}
