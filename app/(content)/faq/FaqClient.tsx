'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface FaqItem {
  question: string;
  answer: string;
  category: 'confection' | 'livraison' | 'retours' | 'atelier';
}

const FAQ_DATA: Record<'fr' | 'es' | 'en', {
  tag: string;
  title: string;
  subtitle: string;
  categories: { key: string; label: string }[];
  items: FaqItem[];
  helpTag: string;
  helpTitle: string;
  helpDesc: string;
  helpBtnContact: string;
  helpBtnEmail: string;
}> = {
  fr: {
    tag: 'Conciergerie & Questions Fréquentes · Maison FOEG Paris',
    title: 'Foire Aux Questions',
    subtitle: 'Découvrez les réponses aux interrogations les plus fréquentes concernant nos confections parisiennes, le suivi de vos commandes et nos services de conciergerie privée.',
    categories: [
      { key: 'all', label: 'Toutes' },
      { key: 'confection', label: 'Confection' },
      { key: 'livraison', label: 'Livraison' },
      { key: 'retours', label: 'Retours' },
      { key: 'atelier', label: 'Atelier' },
    ],
    items: [
      {
        category: 'confection',
        question: 'Où sont façonnées les créations de la Maison FOEG ?',
        answer:
          'Chaque pièce est dessinée dans notre studio parisien et façonnée en séries strictement limitées par des artisans hautement qualifiés situés en France et dans la région de Biella en Italie. Nous sélectionnons exclusivement des matières 100% nobles (cachemire mongol peigné à la main, soie de mûrier et laine mérinos certifiée).',
      },
      {
        category: 'confection',
        question: 'Comment entretenir mon cachemire ou ma soie ?',
        answer:
          'Le cachemire apprécie le repos : laissez respirer votre maille au moins 24 heures entre deux ports. Privilégiez un nettoyage doux auprès d’un teinturier spécialisé dans les fibres nobles. Pour la soie de mûrier, le repassage doit toujours s’effectuer sur l’envers à température modérée et sans projection de vapeur directe.',
      },
      {
        category: 'livraison',
        question: 'Quels sont les délais et modalités d’expédition ?',
        answer:
          'En France Métropolitaine, les commandes sont expédiées sous 24 à 48 heures ouvrées avec remise contre signature. Pour l’Union Européenne, comptez 2 à 3 jours ouvrés. Pour les envois internationaux (États-Unis, Canada, Asie, Amérique Latine), nous opérons via DHL Express (3 à 5 jours ouvrés avec dédouanement prioritaire inclus).',
      },
      {
        category: 'livraison',
        question: 'Comment les pièces sont-elles emballées ?',
        answer:
          'Chaque création est emballée dans du papier de soie gaufré non acide, protégée par une housse en coton biologique certifié et déposée dans un coffret rigide signature FOEG fermé d’un ruban.',
      },
      {
        category: 'retours',
        question: 'Quelle est la politique de retour et d’échange ?',
        answer:
          'La Maison vous accorde un délai de 30 jours à compter de la réception de votre coffret pour essayer vos pièces et solliciter un retour gracieux ou un échange de taille. Les articles doivent être restitués dans leur état originel, non retouchés et munis de l’ensemble de leurs scellés.',
      },
      {
        category: 'retours',
        question: 'Comment obtenir mon étiquette de retour prépayée ?',
        answer:
          'Il vous suffit d’adresser une demande à concierge@foeg-paris.com en précisant votre numéro de commande, ou de vous rendre dans votre espace « Mon Compte ». Une étiquette sécurisée préaffranchie vous sera transmise par courriel.',
      },
      {
        category: 'atelier',
        question: 'Puis-je essayer les créations dans votre atelier parisien ?',
        answer:
          'Absolument. Notre salon privé situé 48 Rue Lucien Sampaix à Paris (75010) vous accueille du lundi au samedi pour une séance d’essayage personnalisée en compagnie d’un conseiller stylistique de la Maison.',
      },
      {
        category: 'atelier',
        question: 'Proposez-vous un service de retouches sur mesure ?',
        answer:
          'Oui, nous offrons un service d’ajustement sur mesure pour nos membres du Cercle Privé ainsi que pour toute commande essayée au sein de notre atelier parisien, garantissant un tombé architectural parfaitement ajusté à votre morphologie.',
      },
    ],
    helpTag: 'Une question non résolue ?',
    helpTitle: 'Contactez notre Conciergerie Privée',
    helpDesc: 'Nos conseillers stylistiques se tiennent à votre disposition par courriel confidentiel ou par téléphone du lundi au samedi.',
    helpBtnContact: 'Prendre Rendez-vous',
    helpBtnEmail: 'Écrire à l’Atelier',
  },
  es: {
    tag: 'Conserjería & Preguntas Frecuentes · Maison FOEG Paris',
    title: 'Preguntas Frecuentes (FAQ)',
    subtitle: 'Descubra las respuestas a las dudas más habituales sobre nuestra confección parisina, el seguimiento de sus pedidos y nuestros servicios de conserjería privada.',
    categories: [
      { key: 'all', label: 'Todas' },
      { key: 'confection', label: 'Confección' },
      { key: 'livraison', label: 'Envíos' },
      { key: 'retours', label: 'Devoluciones' },
      { key: 'atelier', label: 'Atelier' },
    ],
    items: [
      {
        category: 'confection',
        question: '¿Dónde se elaboran las creaciones de Maison FOEG?',
        answer:
          'Cada pieza se diseña en nuestro estudio de París y se elabora en series estrictamente limitadas por artesanos altamente cualificados en Francia y en la histórica región de Biella en Italia. Seleccionamos exclusivamente materias primas 100% nobles (cachemira mongol peinada a mano, seda de morera y lanas vírgenes certificadas).',
      },
      {
        category: 'confection',
        question: '¿Cómo cuidar las prendas de cachemira o seda?',
        answer:
          'El cachemira requiere descanso: permita que las fibras respiren al menos 24 horas entre usos. Recomendamos limpieza en seco especializada. Para la seda de morera, el planchado debe realizarse siempre del revés a temperatura suave y sin vapor directo.',
      },
      {
        category: 'livraison',
        question: '¿Cuáles son los plazos y formas de envío?',
        answer:
          'En Francia y Unión Europea, los pedidos se envían en 24 a 48 horas laborables con entrega bajo firma. Para envíos internacionales a Estados Unidos, Canadá y Latinoamérica, operamos a través de DHL Express (3 a 5 días laborables con gestión aduanera prioritaria incluida).',
      },
      {
        category: 'livraison',
        question: '¿Cómo vienen empaquetadas las prendas?',
        answer:
          'Cada creación se envuelve en papel de seda gofrado sin ácido, resguardada en una funda de viaje de algodón orgánico y entregada en una caja rígida insignia FOEG sellada con cinta.',
      },
      {
        category: 'retours',
        question: '¿Cuál es la política de cambios y devoluciones?',
        answer:
          'La Maison le otorga un plazo de 30 días naturales desde la recepción de su paquete para probarse las piezas y solicitar un cambio de talla o devolución sin costo adicional. Los artículos deben devolverse en su estado original, no alterados y con todos los precintos de taller intactos.',
      },
      {
        category: 'retours',
        question: '¿Cómo obtener mi etiqueta prepagada de devolución?',
        answer:
          'Basta con escribir a concierge@foeg-paris.com indicando su número de pedido o solicitarla directamente desde su área de «Mi Cuenta». Le enviaremos una etiqueta prepagada por correo electrónico de inmediato.',
      },
      {
        category: 'atelier',
        question: '¿Puedo probarme las prendas en el atelier de París?',
        answer:
          'Por supuesto. Nuestro salón privado ubicado en 48 Rue Lucien Sampaix en París (75010) le da la bienvenida de lunes a sábado para una sesión de prueba personalizada con un asesor de la Maison.',
      },
      {
        category: 'atelier',
        question: '¿Ofrecen servicio de ajuste a medida?',
        answer:
          'Sí, ofrecemos servicio de ajuste a medida para los miembros de nuestro Círculo Privado y para clientes que acuden a nuestro taller de París, garantizando una caída arquitectónica impecable.',
      },
    ],
    helpTag: '¿Tiene alguna duda pendiente?',
    helpTitle: 'Contacte a nuestra Conserjería Privada',
    helpDesc: 'Nuestros asesores de estilo se encuentran a su entera disposición por correo electrónico confidencial o teléfono de lunes a sábado.',
    helpBtnContact: 'Solicitar Cita',
    helpBtnEmail: 'Escribir al Atelier',
  },
  en: {
    tag: 'Concierge & Frequently Asked Questions · Maison FOEG Paris',
    title: 'Frequently Asked Questions (FAQ)',
    subtitle: 'Find answers to common questions regarding our Parisian tailoring, order tracking, and private concierge services.',
    categories: [
      { key: 'all', label: 'All' },
      { key: 'confection', label: 'Craftsmanship' },
      { key: 'livraison', label: 'Shipping' },
      { key: 'retours', label: 'Returns' },
      { key: 'atelier', label: 'Atelier' },
    ],
    items: [
      {
        category: 'confection',
        question: 'Where are FOEG garments crafted?',
        answer:
          'Each creation is designed in our Paris studio and crafted in strictly limited series by master artisans located in France and the Biella region of Italy. We exclusively select 100% noble materials (hand-combed Mongolian cashmere, mulberry silk, and certified virgin wools).',
      },
      {
        category: 'confection',
        question: 'How do I care for my cashmere or silk?',
        answer:
          'Cashmere appreciates rest: allow knitwear to aerate for at least 24 hours between wearings. For mulberry silk, always iron on the reverse side at low temperature without direct steam.',
      },
      {
        category: 'livraison',
        question: 'What are the delivery times and methods?',
        answer:
          'In Metropolitan France and the European Union, orders are dispatched within 24 to 48 business hours with signature upon delivery. For international shipments (USA, Canada, Asia, the Americas), we partner with DHL Express (3 to 5 business days with priority customs clearance).',
      },
      {
        category: 'livraison',
        question: 'How are garments packaged?',
        answer:
          'Each piece is enveloped in acid-free tissue paper, protected inside a certified organic cotton garment cover, and delivered inside our signature rigid FOEG box with ribbon.',
      },
      {
        category: 'retours',
        question: 'What is your return and exchange policy?',
        answer:
          'Maison FOEG grants you 30 days from receipt to try on your garments and request a complimentary exchange or return. Items must be returned in their original condition, unworn, and with all atelier seals intact.',
      },
      {
        category: 'retours',
        question: 'How do I obtain a prepaid return label?',
        answer:
          'Simply send a request to concierge@foeg-paris.com specifying your order number, or request it directly within your "My Account" area.',
      },
      {
        category: 'atelier',
        question: 'Can I try on garments in your Paris atelier?',
        answer:
          'Absolutely. Our private salon located at 48 Rue Lucien Sampaix in Paris (75010) welcomes you Monday through Saturday for a private styling consultation.',
      },
      {
        category: 'atelier',
        question: 'Do you offer bespoke tailoring adjustments?',
        answer:
          'Yes, we provide bespoke tailoring adjustments for our Private Circle members and for orders fitted at our Parisian atelier, guaranteeing an architectural fit.',
      },
    ],
    helpTag: 'Have an unresolved question?',
    helpTitle: 'Contact our Private Concierge',
    helpDesc: 'Our styling advisors are at your service via confidential email or phone Monday through Saturday.',
    helpBtnContact: 'Book Consultation',
    helpBtnEmail: 'Write to Atelier',
  },
};

export default function FaqClient() {
  const { language } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const content = FAQ_DATA[language] || FAQ_DATA.fr;

  const filteredItems = content.items.filter((item) =>
    activeCategory === 'all' ? true : item.category === activeCategory
  );

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <article className="pt-28 md:pt-40 pb-32 px-6 md:px-12 max-w-4xl mx-auto animate-fadeIn">
      {/* Retorno */}
      <div className="mb-10">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.2em] text-foeg-muted hover:text-foeg-black transition-colors font-light"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1} />
          <span>
            {language === 'es'
              ? 'Volver al Inicio'
              : language === 'en'
              ? 'Back to Home'
              : 'Retour à l’Accueil'}
          </span>
        </Link>
      </div>

      {/* En-tête */}
      <header className="border-b border-foeg-border/80 pb-8 mb-10 space-y-3">
        <span className="text-[10px] uppercase tracking-[0.3em] text-foeg-navy font-medium block">
          {content.tag}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-foeg-black tracking-tight">
          {content.title}
        </h1>
        <p className="text-xs sm:text-sm text-foeg-muted font-light tracking-wide max-w-2xl leading-relaxed">
          {content.subtitle}
        </p>
      </header>

      {/* Filtres par thématique */}
      <div className="flex items-center space-x-4 sm:space-x-8 overflow-x-auto pb-3 mb-10 border-b border-foeg-border/60 text-xs uppercase tracking-[0.2em] scrollbar-none">
        {content.categories.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategory(cat.key)}
              className={`py-1.5 transition-colors duration-200 cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'text-foeg-black font-medium border-b border-foeg-black'
                  : 'text-foeg-muted hover:text-foeg-black font-light border-b border-transparent'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Acordeón de preguntas */}
      <div className="divide-y divide-foeg-border/80 border-t border-b border-foeg-border/80">
        {filteredItems.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="py-5">
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full text-left flex items-center justify-between space-x-4 cursor-pointer group focus:outline-none"
              >
                <span className="font-serif text-lg sm:text-xl text-foeg-black font-normal group-hover:text-foeg-navy transition-colors">
                  {item.question}
                </span>
                <span
                  className={`p-1 text-foeg-muted transition-transform duration-300 ${
                    isOpen ? 'rotate-180 text-foeg-navy' : ''
                  }`}
                >
                  <ChevronDown className="w-5 h-5 stroke-[1.2]" />
                </span>
              </button>

              {isOpen && (
                <div className="pt-4 pb-2 pr-6 text-xs sm:text-sm text-foeg-black/80 font-light leading-relaxed animate-fadeIn">
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bloc de Conciergerie Privée */}
      <div className="mt-16 p-8 border border-foeg-navy/30 bg-foeg-surface/40 space-y-4 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1 max-w-md">
          <span className="text-[10px] uppercase tracking-[0.25em] text-foeg-navy font-medium block">
            {content.helpTag}
          </span>
          <h2 className="font-serif text-2xl text-foeg-black font-light">
            {content.helpTitle}
          </h2>
          <p className="text-xs text-foeg-muted font-light leading-relaxed">
            {content.helpDesc}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <Link
            href="/contacto"
            className="w-full sm:w-auto px-6 py-3 bg-foeg-navy text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-black transition-colors text-center"
          >
            {content.helpBtnContact}
          </Link>
          <a
            href="mailto:concierge@foeg-paris.com"
            className="w-full sm:w-auto px-6 py-3 border border-foeg-border hover:border-foeg-black text-foeg-black text-xs uppercase tracking-[0.2em] transition-colors text-center"
          >
            {content.helpBtnEmail}
          </a>
        </div>
      </div>
    </article>
  );
}
