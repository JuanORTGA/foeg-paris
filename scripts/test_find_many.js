const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const res = await prisma.siteContent.findMany({
      select: {
        key: true,
        valueFr: true,
        valueEn: true,
        valueEs: true,
      },
    });
    console.log('SUCCESS! Count:', res.length);
    const hero = res.find(r => r.key === 'hero_image');
    console.log('Hero image from Prisma findMany:', hero);
    const pos = res.find(r => r.key === 'hero_banner_card_pos');
    console.log('Pos from Prisma findMany:', pos);
  } catch (err) {
    console.error('ERROR IN FIND_MANY:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
