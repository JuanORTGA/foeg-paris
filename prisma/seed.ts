import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { MOCK_PRODUCTS } from '../lib/mock-data';

const prisma = new PrismaClient();

async function main() {
  console.log('Début du chargement des pièces et comptes de la Maison FOEG Paris...');

  // 1. Initialisation de l'Administrateur par défaut
  const hashedPassword = await bcrypt.hash('foeg2026', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@foeg-paris.com' },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
      name: 'Direction FOEG Paris',
    },
    create: {
      email: 'admin@foeg-paris.com',
      password: hashedPassword,
      role: 'ADMIN',
      name: 'Direction FOEG Paris',
    },
  });
  console.log(`✓ Administrateur initialisé: ${admin.email} (Rôle: ${admin.role})`);

  // 2. Nettoyage des anciennes pièces pour éviter les doublons
  await prisma.orderItem.deleteMany({}).catch(() => {});
  await prisma.order.deleteMany({}).catch(() => {});
  await prisma.measurement.deleteMany({}).catch(() => {});
  await prisma.variant.deleteMany({}).catch(() => {});
  await prisma.product.deleteMany({}).catch(() => {});

  // 3. Création des 6 pièces de Haute Couture
  for (const p of MOCK_PRODUCTS) {
    const product = await prisma.product.create({
      data: {
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: p.price,
        currency: p.currency,
        description: p.description,
        category: p.category,
        subcategory: p.subcategory || null,
        images: [...p.images],
        isNew: p.isNew,
        composition: p.composition,
        origin: p.origin,
        care: [...p.care],
        variants: {
          create: p.variants.map((v) => ({
            size: v.size,
            stock: v.stock,
            color: v.color,
          })),
        },
        measurements: {
          create: p.measurements.map((m) => ({
            size: m.size,
            chest: m.chest || '-',
            waist: m.waist || '-',
            hips: m.hips || '-',
            length: m.length || (m.inseam ? `Entrejambe: ${m.inseam}` : '-'),
          })),
        },
      },
    });

    console.log(`✓ Pièce créée: ${product.name} (${product.category} · ${product.subcategory || 'Collection'})`);
  }

  console.log('\n Succès: Base de données synchronisée avec l’administrateur et les 6 pièces emblématiques.');
}

main()
  .catch((e) => {
    console.error('Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
