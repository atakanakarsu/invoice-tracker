import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
    // Create default Departments
    const departments = ['IT', 'HR', 'Finance', 'Operations', 'Sales']

    for (const dept of departments) {
        await prisma.department.upsert({
            where: { name: dept },
            update: {},
            create: { name: dept },
        })
    }

    // Create default Reject Reasons
    const reasons = ['Incorrect Amount', 'Wrong Currency', 'Missing Description', 'Duplicate Invoice', 'Other']
    for (const reason of reasons) {
        await prisma.rejectReason.upsert({
            where: { description: reason },
            update: {},
            create: { description: reason },
        })
    }

    console.log('Seeding completed.')
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
