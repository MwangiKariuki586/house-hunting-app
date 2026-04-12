
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('--- Cleaning Orphan Listings ---');
    
    // Fetch all listings
    const listings = await prisma.listing.findMany();
    console.log(`Checking ${listings.length} listings...`);
    
    let deletedCount = 0;

    for (const listing of listings) {
        // Check if landlord exists
        const landlord = await prisma.user.findUnique({
            where: { id: listing.landlordId }
        });

        if (!landlord) {
            console.log(`[DELETE] Listing ${listing.id} has no landlord (${listing.landlordId}). Deleting...`);
            await prisma.listing.delete({
                where: { id: listing.id }
            });
            deletedCount++;
        }
    }

    console.log(`Cleanup complete. Deleted ${deletedCount} orphan listings.`);

  } catch (e) {
    console.error('Error during cleanup:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
