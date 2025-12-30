import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const clients = [
    {
      name: 'Mroj Pharmacy (Alsqar)',
      industry: 'Pharmacy',
      status: 'ACTIVE',
      phone: '9647700000000',
      priceQuoted: 1500,
      amountPaid: 1500,
      projectUrl: 'https://alsqar.vercel.app',
    },
    {
      name: 'Coral Perfumes',
      industry: 'E-Commerce',
      status: 'PENDING',
      phone: '9647800000000',
      priceQuoted: 2000,
      amountPaid: 500,
      projectUrl: 'https://coral-perfumes.vercel.app',
    },
    {
      name: 'Mahshi Albaghdady',
      industry: 'Restaurant',
      status: 'ACTIVE',
      phone: '9647500000000',
      priceQuoted: 1200,
      amountPaid: 1200,
      projectUrl: 'https://mahshi.vercel.app',
    },
    {
      name: 'Leera Home',
      industry: 'Home Goods',
      status: 'LEAD',
      priceQuoted: 0,
      amountPaid: 0,
      projectUrl: 'https://leera-home.vercel.app',
    },
    {
      name: 'Touch Beaut',
      industry: 'Cosmetics',
      status: 'SUSPENDED',
      phone: '9647711111111',
      priceQuoted: 1800,
      amountPaid: 100,
      projectUrl: 'https://touch-beaut.vercel.app',
    },
     {
      name: 'Morano Watches',
      industry: 'E-Commerce',
      status: 'ACTIVE',
      priceQuoted: 2500,
      amountPaid: 2500,
      projectUrl: 'https://morano.vercel.app',
    }
  ]

  console.log('Start seeding...')
  for (const c of clients) {
    const client = await prisma.client.create({
      data: {
        name: c.name,
        industry: c.industry,
        // @ts-ignore
        status: c.status,
        phone: c.phone,
        priceQuoted: c.priceQuoted,
        amountPaid: c.amountPaid,
        projectUrl: c.projectUrl,
      }
    })
    console.log(`Created client with id: ${client.id}`)
  }
  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
