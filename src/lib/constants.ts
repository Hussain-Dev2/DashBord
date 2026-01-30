
// استيراد أنواع البيانات من مكتبة Prisma
// Import data types from Prisma library
import { Client, Status } from '@prisma/client'

// قائمة البريد الإلكتروني للمسؤولين (المديرين)
// List of admin email addresses
export const ADMIN_EMAILS = [
  'dev.hussain90@gmail.com',
  'omimaahmed2712@gmail.com',
  'huiq998877@gmail.com'
]

// نوع مساعد لبيانات العملاء التجريبية، يتجاهل الحقول المعقدة أو يضيف أنواعاً مرتبة
// Helper type for sample client data, omitting complex fields or adding related types
export const SAMPLE_CLIENTS: (Omit<Client, 'priceQuoted' | 'amountPaid'> & { 
  priceQuoted: number, 
  amountPaid: number,
  notes: any[] 
})[] = [
  {
    id: 'demo-1', // المعرف الفريد
    name: 'TechCorp Solutions', // اسم الشركة
    industry: 'Technology', // مجال العمل: تكنولوجيا
    phone: '+1 555-0123', // رقم الهاتف
    logoUrl: null, // رابط الشعار
    projectUrl: 'https://demo-techcorp.com', // رابط المشروع
    repoUrl: 'https://github.com/demo/techcorp', // رابط الكود البرمجي
    priceQuoted: 5000, // السعر المعروض
    amountPaid: 2500, // المبلغ المدفوع
    status: 'ACTIVE', // الحالة: نشط
    createdAt: new Date(), // تاريخ الإنشاء
    updatedAt: new Date(), // تاريخ التحديث
    notes: [ // الملاحظات
      { id: 'note-1', content: 'Initial meeting went well.', createdAt: new Date(), clientId: 'demo-1' }
    ]
  },
  {
    id: 'demo-2',
    name: 'GreenLeaf Organics',
    industry: 'Retail', // مجال العمل: تجارة تجزئة
    phone: '+1 555-0456',
    logoUrl: null,
    projectUrl: 'https://demo-greenleaf.com',
    repoUrl: null,
    priceQuoted: 3000,
    amountPaid: 3000,
    status: 'ACTIVE', 
    createdAt: new Date(),
    updatedAt: new Date(),
    notes: []
  },
  {
    id: 'demo-3',
    name: 'Rapid Logistics',
    industry: 'Transport', // مجال العمل: نقل
    phone: '+1 555-0789',
    logoUrl: null,
    projectUrl: null,
    repoUrl: null,
    priceQuoted: 7500,
    amountPaid: 0,
    status: 'PENDING', // الحالة: معلق
    createdAt: new Date(),
    updatedAt: new Date(),
    notes: []
  }
]
