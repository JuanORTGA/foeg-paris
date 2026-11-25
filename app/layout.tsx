// FOEG Paris - Maison de Confection Française
import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import './globals.css';
import StoreShell from '@/components/layout/StoreShell';
import { CartProvider } from '@/lib/cart-context';
import { LanguageProvider, Language } from '@/lib/language-context';
import { CurrencyProvider } from '@/lib/currency-context';
import { WishlistProvider } from '@/lib/wishlist-context';
import AuthProvider from '@/components/providers/AuthProvider';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'FOEG Paris | Maison de Confection Française',
  description:
    'Maison de confection française située rue Lucien Sampaix, Paris 75010. L’art de l’essentiel, coupes architecturales, matières nobles et silhouettes intemporelles.',
  keywords: [
    'FOEG Paris',
    'Maison de confection française',
    'Haute couture Paris',
    'rue Lucien Sampaix Paris 75010',
    'Luxe silencieux',
    'Prêt-à-porter de luxe',
  ],
  icons: {
    icon: '/logo-foeg.png',
    shortcut: '/logo-foeg.png',
    apple: '/logo-foeg.png',
  },
  openGraph: {
    title: 'FOEG Paris | Maison de Confection Française',
    description:
      'Maison de confection française située rue Lucien Sampaix à Paris (75010). L’art de l’essentiel, coupes architecturales et matières nobles.',
    url: 'https://foeg-paris.com',
    siteName: 'FOEG Paris',
    locale: 'fr_FR',
    type: 'website',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Lecture sécurisée du cookie foeg_lang en Next.js 15
  let initialLanguage: Language = 'fr';
  try {
    const cookieStore = await cookies();
    const cookieLang = cookieStore.get('foeg_lang')?.value as Language | undefined;
    if (cookieLang === 'fr' || cookieLang === 'en' || cookieLang === 'es') {
      initialLanguage = cookieLang;
    }
  } catch {
    initialLanguage = 'fr';
  }

  return (
    <html lang={initialLanguage} suppressHydrationWarning>
      <body
        className="bg-foeg-white text-foeg-black font-sans min-h-screen flex flex-col selection:bg-foeg-navy selection:text-foeg-white"
        suppressHydrationWarning
      >
        <AuthProvider>
          <LanguageProvider initialLanguage={initialLanguage}>
            <CurrencyProvider>
              <WishlistProvider>
                <CartProvider>
                  <StoreShell>{children}</StoreShell>
                </CartProvider>
              </WishlistProvider>
            </CurrencyProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
