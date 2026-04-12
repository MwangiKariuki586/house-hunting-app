
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('--- Testing Recent Listings ---');
    
    // Fetch recent 5 listings
    const listings = await prisma.listing.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    console.log(`Found ${listings.length} listings.`);

    for (const listing of listings) {
        console.log(`Checking Listing: ${listing.id} (Status: ${listing.status})`);
        
        // Check Landlord
        const landlord = await prisma.user.findUnique({
            where: { id: listing.landlordId }
        });

        if (!landlord) {
            console.error(`  !! ORPHAN !! Landlord ${listing.landlordId} not found.`);
            continue;
        }
        console.log(`  Landlord found: ${landlord.id}`);

        // Check Verification
        const verif = await prisma.landlordVerification.findUnique({
            where: { userId: landlord.id }
        });
        console.log(`  Verification: ${verif ? verif.status : 'MISSING'}`);
    }

  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
