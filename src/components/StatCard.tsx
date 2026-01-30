// استيراد أيقونات Lucide
// Import Lucide icons
import { LucideIcon } from 'lucide-react'

// تعريف واجهة خصائص بطاقة الإحصائيات
// Define the interface for Stat Card props
interface StatCardProps {
  title: string // العنوان (مثل: إجمالي العملاء)
  value: string // القيمة (مثل: 50)
  icon: LucideIcon // الأيقونة
  description?: string // وصف إضافي اختياري
  isEmpty?: boolean // هل البيانات فارغة؟ (لتغيير الشكل)
}

// مكون بطاقة الإحصائيات
// Stat Card Component
export function StatCard({ title, value, icon: Icon, description, isEmpty }: StatCardProps) {
  return (
    <div className={`relative bg-gradient-to-br from-nexa-gray/40 to-nexa-gray/20 border border-white/10 rounded-2xl p-7 hover:border-nexa-gold/40 hover:shadow-xl hover:shadow-nexa-gold/5 transition-all duration-300 ${isEmpty ? 'opacity-70' : ''}`}>
      {/* القسم العلوي: العنوان والأيقونة */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-gray-400 text-sm font-semibold uppercase tracking-wide">{title}</span>
        <div className={`p-3 rounded-xl ${isEmpty ? 'bg-white/5' : 'bg-gradient-to-br from-nexa-gold/20 to-nexa-gold/10 shadow-lg shadow-nexa-gold/10'}`}>
          <Icon className={`h-6 w-6 ${isEmpty ? 'text-gray-500' : 'text-nexa-gold'}`} />
        </div>
      </div>
      {/* القيمة الكبيرة */}
      <div className="text-4xl font-bold text-white mb-3 tracking-tight">{value}</div>
      {/* الوصف الإضافي */}
      {description && (
        <p className={`text-sm leading-relaxed ${isEmpty ? 'text-gray-500 italic' : 'text-gray-400'}`}>
          {description}
        </p>
      )}
      {/* خلفية جمالية إذا لم تكن فارغة */}
      {!isEmpty && <div className="absolute inset-0 bg-gradient-to-br from-nexa-gold/5 to-transparent rounded-2xl pointer-events-none"></div>}
    </div>
  )
}
