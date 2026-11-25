'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { createNotification } from '@/lib/notifications';

export async function createProduct(formData: FormData) {
  try {
    const name = String(formData.get('name') || '').trim();
    const rawPrice = String(formData.get('price') || '0').replace(',', '.');
    const price = parseFloat(rawPrice) || 0;
    const category = (formData.get('category') as string) || 'Mujer';
    const subcategory = String(formData.get('subcategory') || 'Manteaux').trim();
    const badge = String(formData.get('badge') || '').trim() || null;
    const description = String(formData.get('description') || '').trim();
    const composition = String(formData.get('composition') || '').trim() || '100% Fibres Naturelles de Haute Couture';
    const origin = String(formData.get('origin') || '').trim() || 'Confectionné à la main à Paris';
    const imageUrl = String(formData.get('image') || '').trim();
    const imagesJsonRaw = String(formData.get('imagesJson') || '').trim();

    let imagesList: string[] = [];
    if (imagesJsonRaw) {
      try {
        const parsed = JSON.parse(imagesJsonRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          imagesList = parsed.filter((u: any) => typeof u === 'string' && u.trim().length > 0);
        }
      } catch {}
    }
    if (imagesList.length === 0 && imageUrl) {
      imagesList = [imageUrl];
    }
    if (imagesList.length === 0) {
      imagesList = ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85'];
    }

    // Tailles et Couleurs dynamiques
    const sizesJsonRaw = String(formData.get('sizesJson') || '').trim();
    const colorsJsonRaw = String(formData.get('colorsJson') || '').trim();

    let sizesMap: Record<string, number> = {};
    if (sizesJsonRaw) {
      try {
        sizesMap = JSON.parse(sizesJsonRaw);
      } catch {}
    }

    if (Object.keys(sizesMap).length === 0) {
      const stockS = Math.max(0, parseInt(String(formData.get('stockS') || '5'), 10) || 0);
      const stockM = Math.max(0, parseInt(String(formData.get('stockM') || '10'), 10) || 0);
      const stockL = Math.max(0, parseInt(String(formData.get('stockL') || '3'), 10) || 0);
      sizesMap = { S: stockS, M: stockM, L: stockL };
    }

    let colorsList: string[] = [];
    if (colorsJsonRaw) {
      try {
        colorsList = JSON.parse(colorsJsonRaw);
      } catch {}
    }
    if (colorsList.length === 0) {
      colorsList = ['Noir Carbone'];
    }

    if (!name || price <= 0) {
      return { success: false, error: 'Veuillez saisir un nom et un prix valide.' };
    }

    const baseSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const slug = `${baseSlug || 'produit'}-${Date.now().toString().slice(-4)}`;
    const imageToUse =
      imageUrl ||
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85';

    // Grille de variantes pour chaque couleur × taille
    const variantsData: { size: string; stock: number; color: string }[] = [];
    for (const color of colorsList) {
      for (const [size, stock] of Object.entries(sizesMap)) {
        variantsData.push({
          size,
          stock: Math.max(0, parseInt(String(stock), 10) || 0),
          color,
        });
      }
    }

    // 1. Création du produit avec variantes dynamiques et guide de mesures
    const product = await prisma.product.create({
      data: {
        slug,
        name,
        price: parseFloat(price.toFixed(2)),
        currency: '€',
        category,
        subcategory,
        badge,
        description: description || 'Création exclusive confectionnée au sein de nos ateliers parisiens.',
        composition,
        origin,
        care: ['Nettoyage à sec spécialisé uniquement', 'Aérer sur cintre en cèdre'],
        images: imagesList,
        isNew: true,
        variants: {
          create: variantsData,
        },
        measurements: {
          create: [
            { size: 'S', chest: '92 cm', waist: '74 cm', hips: '98 cm', length: '115 cm' },
            { size: 'M', chest: '98 cm', waist: '80 cm', hips: '104 cm', length: '117 cm' },
            { size: 'L', chest: '104 cm', waist: '86 cm', hips: '110 cm', length: '119 cm' },
          ],
        },
      },
      include: {
        variants: true,
      },
    });

    // 2. Notification interne pour l'Atelier (non-bloquante)
    try {
      await createNotification({
        title: 'Nouveau Produit Ajouté',
        message: `La pièce "${name}" (${price.toLocaleString('fr-FR')} €) a rejoint la collection ${category}.`,
        type: 'product',
        link: '/admin/productos',
      });
    } catch (notifErr) {
      console.warn('[NOTIFICATION NON-BLOCKING]:', notifErr);
    }

    // 3. Revalidation des pages pour mise à jour instantanée
    revalidatePath('/admin/productos');
    revalidatePath('/mujer');
    revalidatePath('/hombre');
    revalidatePath('/femme');
    revalidatePath('/colecciones');
    revalidatePath('/');
    revalidatePath(`/producto/${slug.replace(/^\//, '')}`);

    return {
      success: true,
      product: {
        ...product,
        price: Number(product.price),
      },
    };
  } catch (error: any) {
    console.error("Error guardando producto:", error);
    return {
      success: false,
      error: error?.message || "No se pudo guardar el producto.",
    };
  }
}

export async function deleteProduct(id: string) {
  try {
    const deleted = await prisma.product.delete({
      where: { id },
    });

    await createNotification({
      title: 'Pièce Retirée du Catalogue',
      message: `La pièce "${deleted.name}" a été supprimée de la base de données.`,
      type: 'product',
      link: '/admin/productos',
    });

    revalidatePath('/admin/productos');
    revalidatePath('/mujer');
    revalidatePath('/hombre');
    revalidatePath('/femme');
    revalidatePath('/');

    return { success: true };
  } catch (err: any) {
    console.error('[DELETE PRODUCT ERROR]:', err);
    return { success: false, error: err?.message || 'Erreur lors de la suppression.' };
  }
}

export async function updateProduct(formData: FormData) {
  try {
    const id = String(formData.get('id') || '').trim();
    const name = String(formData.get('name') || '').trim();
    const rawPrice = String(formData.get('price') || '0').replace(',', '.');
    const price = parseFloat(rawPrice) || 0;
    const category = (formData.get('category') as string) || 'Mujer';
    const subcategory = String(formData.get('subcategory') || 'Manteaux').trim();
    const badge = String(formData.get('badge') || '').trim() || null;
    const description = String(formData.get('description') || '').trim();
    const composition = String(formData.get('composition') || '').trim() || '100% Fibres Naturelles de Haute Couture';
    const origin = String(formData.get('origin') || '').trim() || 'Confectionné à la main à Paris';
    const imageUrl = String(formData.get('image') || '').trim();
    const imagesJsonRaw = String(formData.get('imagesJson') || '').trim();

    let imagesList: string[] = [];
    if (imagesJsonRaw) {
      try {
        const parsed = JSON.parse(imagesJsonRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          imagesList = parsed.filter((u: any) => typeof u === 'string' && u.trim().length > 0);
        }
      } catch {}
    }
    if (imagesList.length === 0 && imageUrl) {
      imagesList = [imageUrl];
    }
    if (imagesList.length === 0) {
      imagesList = ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85'];
    }

    // Tailles et Couleurs dynamiques
    const sizesJsonRaw = String(formData.get('sizesJson') || '').trim();
    const colorsJsonRaw = String(formData.get('colorsJson') || '').trim();

    if (!id || !name || price <= 0) {
      return { success: false, error: 'Identifiant, nom et prix valide requis.' };
    }

    const existing = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!existing) {
      return { success: false, error: 'Produit introuvable dans la base de données.' };
    }

    let images = existing.images;
    if (imageUrl) {
      images = [imageUrl, imageUrl, imageUrl];
    }

    // Mise à jour de la grille de variantes
    if (sizesJsonRaw) {
      let sizesMap: Record<string, number> = {};
      try {
        sizesMap = JSON.parse(sizesJsonRaw);
      } catch {}

      let colorsList: string[] = [];
      if (colorsJsonRaw) {
        try {
          colorsList = JSON.parse(colorsJsonRaw);
        } catch {}
      }
      if (colorsList.length === 0) {
        colorsList = Array.from(new Set(existing.variants.map((v) => v.color).filter(Boolean)));
        if (colorsList.length === 0) colorsList = ['Noir Carbone'];
      }

      // Remplacement propre des variantes
      await prisma.variant.deleteMany({
        where: { productId: id },
      });

      const newVariantsData: { productId: string; size: string; stock: number; color: string }[] = [];
      for (const color of colorsList) {
        for (const [size, stock] of Object.entries(sizesMap)) {
          newVariantsData.push({
            productId: id,
            size,
            stock: Math.max(0, Number(stock) || 0),
            color,
          });
        }
      }

      if (newVariantsData.length > 0) {
        await prisma.variant.createMany({
          data: newVariantsData,
        });
      }
    } else {
      // Fallback classique si sizesJson n'a pas été envoyé
      const stockS = parseInt(String(formData.get('stockS') || ''), 10);
      const stockM = parseInt(String(formData.get('stockM') || ''), 10);
      const stockL = parseInt(String(formData.get('stockL') || ''), 10);

      const stockEntries: [string, number][] = [];
      if (!isNaN(stockS)) stockEntries.push(['S', Math.max(0, stockS)]);
      if (!isNaN(stockM)) stockEntries.push(['M', Math.max(0, stockM)]);
      if (!isNaN(stockL)) stockEntries.push(['L', Math.max(0, stockL)]);

      for (const [size, stock] of stockEntries) {
        const match = existing.variants.find((v) => v.size === size);
        if (match) {
          await prisma.variant.update({
            where: { id: match.id },
            data: { stock },
          });
        } else {
          await prisma.variant.create({
            data: {
              productId: id,
              size,
              stock,
              color: 'Noir Carbone',
            },
          });
        }
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        price: Number(price),
        category,
        subcategory,
        badge,
        description,
        composition,
        origin,
        images: imagesList,
      },
      include: {
        variants: true,
      },
    });

    try {
      await createNotification({
        title: 'Pièce Modifiée dans l’Atelier',
        message: `La pièce "${name}" (${price.toLocaleString('fr-FR')} €) a été mise à jour dans Neon.`,
        type: 'product',
        link: '/admin/productos',
      });
    } catch (notifErr) {
      console.warn('[NOTIFICATION NON-BLOCKING]:', notifErr);
    }

    revalidatePath('/admin/productos');
    revalidatePath('/mujer');
    revalidatePath('/hombre');
    revalidatePath('/femme');
    revalidatePath('/colecciones');
    revalidatePath(`/producto/${updated.slug}`);
    revalidatePath('/');

    return {
      success: true,
      product: {
        ...updated,
        price: Number(updated.price),
      },
    };
  } catch (error: any) {
    console.error("Error guardando producto:", error);
    return {
      success: false,
      error: error?.message || "No se pudo guardar el producto.",
    };
  }
}
