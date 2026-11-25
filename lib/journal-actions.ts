'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { createNotification } from '@/lib/notifications';
import { JOURNAL_ARTICLES, JournalArticle } from '@/lib/journal-data';
import { translateText } from '@/lib/translate';

const JOURNAL_STORAGE_KEY = 'site_journal_articles';

/**
 * Récupère tous les articles du Journal enregistrés dans Neon PostgreSQL
 */
export async function getJournalArticles(): Promise<JournalArticle[]> {
  try {
    const record = await prisma.siteContent.findUnique({
      where: { key: JOURNAL_STORAGE_KEY },
    });

    if (record?.valueFr) {
      const parsed = JSON.parse(record.valueFr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[GET JOURNAL ARTICLES DB ERROR]:', err);
  }

  // Fallback initial aux articles de haute confection
  return JOURNAL_ARTICLES;
}

/**
 * Récupère un article spécifique par son slug
 */
export async function getJournalArticleBySlug(slug: string): Promise<JournalArticle | undefined> {
  const articles = await getJournalArticles();
  return articles.find((a) => a.slug === slug);
}

/**
 * Crée ou modifie un article (CREATE / UPDATE)
 */
export async function saveJournalArticle(
  articleData: {
    id?: string;
    title: string;
    category: string;
    excerpt: string;
    body: string;
    readTime?: string;
    image?: string;
    author?: string;
  }
): Promise<{ success: boolean; article?: JournalArticle; error?: string }> {
  try {
    if (!articleData.title.trim() || !articleData.body.trim()) {
      return { success: false, error: 'Le titre et le corps de texte sont obligatoires.' };
    }

    const currentArticles = await getJournalArticles();

    const slug = articleData.title
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const paragraphs = articleData.body
      .split('\n\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const nowFormatted = new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());

    let savedArticle: JournalArticle;

    if (articleData.id) {
      // UPDATE
      const index = currentArticles.findIndex((a) => a.id === articleData.id);
      if (index === -1) {
        return { success: false, error: 'Article introuvable pour modification.' };
      }

      savedArticle = {
        ...currentArticles[index],
        title: articleData.title.trim(),
        slug: slug || currentArticles[index].slug,
        category: articleData.category || currentArticles[index].category,
        excerpt: articleData.excerpt.trim() || currentArticles[index].excerpt,
        content: paragraphs.length > 0 ? paragraphs : currentArticles[index].content,
        readTime: articleData.readTime || currentArticles[index].readTime,
        image: articleData.image || currentArticles[index].image,
        author: articleData.author || currentArticles[index].author || 'Direction Artistique FOEG',
      };

      currentArticles[index] = savedArticle;
    } else {
      // CREATE
      savedArticle = {
        id: `art-${Date.now()}`,
        slug: slug || `article-${Date.now()}`,
        title: articleData.title.trim(),
        subtitle: articleData.excerpt.slice(0, 90) || 'Nouvel essai de la Maison FOEG Paris',
        category: articleData.category || 'Savoir-Faire',
        date: nowFormatted,
        readTime: articleData.readTime || '5 min de lecture',
        author: articleData.author || 'Direction Artistique FOEG',
        image:
          articleData.image ||
          'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1600&q=85',
        excerpt: articleData.excerpt.trim() || articleData.body.slice(0, 160) + '...',
        content: paragraphs.length > 0 ? paragraphs : [articleData.body.trim()],
      };

      // Génération automatique des traductions trilingues pour l'article
      try {
        const [titleEs, titleEn, excerptEs, excerptEn] = await Promise.all([
          translateText(savedArticle.title, 'es'),
          translateText(savedArticle.title, 'en'),
          translateText(savedArticle.excerpt, 'es'),
          translateText(savedArticle.excerpt, 'en'),
        ]);

        savedArticle.translations = {
          es: {
            title: titleEs || savedArticle.title,
            subtitle: excerptEs.slice(0, 90) || savedArticle.subtitle,
            excerpt: excerptEs || savedArticle.excerpt,
            content: savedArticle.content,
            date: new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()),
            readTime: savedArticle.readTime.replace('de lecture', 'de lectura'),
            author: savedArticle.author.replace('Direction Artistique', 'Dirección Artística'),
            category: savedArticle.category === 'Savoir-Faire' ? 'Saber Hacer' : savedArticle.category,
          },
          en: {
            title: titleEn || savedArticle.title,
            subtitle: excerptEn.slice(0, 90) || savedArticle.subtitle,
            excerpt: excerptEn || savedArticle.excerpt,
            content: savedArticle.content,
            date: new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()),
            readTime: savedArticle.readTime.replace('de lecture', 'read'),
            author: savedArticle.author.replace('Direction Artistique', 'Artistic Direction'),
            category: savedArticle.category === 'Savoir-Faire' ? 'Craftsmanship' : savedArticle.category,
          },
        };
      } catch (transErr) {
        console.warn('[TRANSLATE JOURNAL ARTICLE WARNING]:', transErr);
      }

      currentArticles.unshift(savedArticle);

      // Notification en temps réel pour l'administrateur
      try {
        await createNotification({
          title: 'Nouvel Essai Publié au Journal',
          message: `L'essai "${savedArticle.title}" (${savedArticle.category}) a été publié dans le Journal FOEG.`,
          type: 'info',
          link: '/admin/journal',
        });
      } catch (notifErr) {
        console.warn('[NOTIF JOURNAL ERROR]:', notifErr);
      }
    }

    await saveArticlesToDb(currentArticles);

    try {
      revalidatePath('/admin/journal');
      revalidatePath('/journal');
      revalidatePath(`/journal/${savedArticle.slug}`);
    } catch {}

    return { success: true, article: savedArticle };
  } catch (err: any) {
    console.error('[SAVE JOURNAL ARTICLE ERROR]:', err);
    return { success: false, error: err.message || 'Erreur lors de la sauvegarde de l’essai.' };
  }
}

/**
 * Supprime un article du Journal (DELETE)
 */
export async function deleteJournalArticle(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const currentArticles = await getJournalArticles();
    const filtered = currentArticles.filter((a) => a.id !== id);
    await saveArticlesToDb(filtered);

    try {
      revalidatePath('/admin/journal');
      revalidatePath('/journal');
    } catch {}

    return { success: true };
  } catch (err: any) {
    console.error('[DELETE JOURNAL ARTICLE ERROR]:', err);
    return { success: false, error: 'Impossible de supprimer cet article.' };
  }
}

// Persistance Neon PostgreSQL
async function saveArticlesToDb(articles: JournalArticle[]) {
  const serialized = JSON.stringify(articles);
  await prisma.siteContent.upsert({
    where: { key: JOURNAL_STORAGE_KEY },
    create: {
      key: JOURNAL_STORAGE_KEY,
      section: 'journal',
      valueFr: serialized,
      valueEn: serialized,
      valueEs: serialized,
    },
    update: {
      valueFr: serialized,
      valueEn: serialized,
      valueEs: serialized,
    },
  });
}
