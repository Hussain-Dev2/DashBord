import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearDatabase() {
  console.log('🗑️  Clearing all clients and notes...')
  
  // Delete all notes first (due to foreign key constraint)
  await prisma.note.deleteMany({})
  console.log('✅ Deleted all notes')
  
  // Delete all clients
  await prisma.client.deleteMany({})
  console.log('✅ Deleted all clients')
  
  console.log('✨ Database cleared! Revenue is now $0')
}

clearDatabase()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
