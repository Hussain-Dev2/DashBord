
import { Client, Status } from '@prisma/client'

export const ADMIN_EMAIL = 'devhussain90@gmail.com'

// Helper type for the sample clients, omitting fields that might be problematic or adding related types
// We use 'any' for Decimal fields in this sample array to avoid Decimal object instantiation issues in simple constants,
// but in a real app we might want to be more strict. The UI handles numbers/Decimals usually.
export const SAMPLE_CLIENTS: (Omit<Client, 'priceQuoted' | 'amountPaid'> & { 
  priceQuoted: number, 
  amountPaid: number,
  notes: any[] 
})[] = [
  {
    id: 'demo-1',
    name: 'TechCorp Solutions',
    industry: 'Technology',
    phone: '+1 555-0123',
    logoUrl: null,
    projectUrl: 'https://demo-techcorp.com',
    repoUrl: 'https://github.com/demo/techcorp',
    priceQuoted: 5000,
    amountPaid: 2500,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
    notes: [
      { id: 'note-1', content: 'Initial meeting went well.', createdAt: new Date(), clientId: 'demo-1' }
    ]
  },
  {
    id: 'demo-2',
    name: 'GreenLeaf Organics',
    industry: 'Retail',
    phone: '+1 555-0456',
    logoUrl: null,
    projectUrl: 'https://demo-greenleaf.com',
    repoUrl: null,
    priceQuoted: 3000,
    amountPaid: 3000,
    status: 'ACTIVE', // Was COMPLETED, mapped to ACTIVE for now or SUSPENDED? Let's use ACTIVE.
    createdAt: new Date(),
    updatedAt: new Date(),
    notes: []
  },
  {
    id: 'demo-3',
    name: 'Rapid Logistics',
    industry: 'Transport',
    phone: '+1 555-0789',
    logoUrl: null,
    projectUrl: null,
    repoUrl: null,
    priceQuoted: 7500,
    amountPaid: 0,
    status: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
    notes: []
  }
]
