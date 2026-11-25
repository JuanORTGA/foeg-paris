const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const item = await prisma.siteContent.findUnique({
      where: { key: 'reel_video_1' }
    });
    console.log('REEL_VIDEO_1:', JSON.stringify(item, null, 2));

    const heroVid = await prisma.siteContent.findUnique({
      where: { key: 'hero_video' }
    });
    console.log('HERO_VIDEO:', JSON.stringify(heroVid, null, 2));

    const heroImg = await prisma.siteContent.findUnique({
      where: { key: 'hero_image' }
    });
    console.log('HERO_IMAGE:', JSON.stringify(heroImg, null, 2));
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
