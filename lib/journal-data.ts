export interface JournalArticle {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  content: string[];
  date: string;
  readTime: string;
  author: string;
  image: string;
  internalImages?: string[];
  category: string;
  pullQuote?: string;
  translations?: {
    es?: {
      title: string;
      subtitle: string;
      excerpt: string;
      content: string[];
      date: string;
      readTime: string;
      author: string;
      image?: string;
      internalImages?: string[];
      category: string;
      pullQuote?: string;
    };
    en?: {
      title: string;
      subtitle: string;
      excerpt: string;
      content: string[];
      date: string;
      readTime: string;
      author: string;
      image?: string;
      internalImages?: string[];
      category: string;
      pullQuote?: string;
    };
  };
}

export const JOURNAL_ARTICLES: JournalArticle[] = [
  {
    id: 'art-001',
    slug: 'l-art-du-drape',
    title: "L'Art du Drapé",
    subtitle: 'Étude sur le mouvement de la soie et la géométrie des tombés',
    excerpt:
      'Dans le silence de l’atelier, le tissu ne se plie pas : il s’écoute. Comment la coupe en plein biais libère le corps de toute contrainte mécanique.',
    date: '14 Novembre 2026',
    readTime: '5 min de lecture',
    author: 'Direction Artistique FOEG',
    category: 'Savoir-Faire',
    pullQuote: '« La forme véritable ne résulte jamais d’une surcharge, mais de l’élimination rigoureuse de tout ce qui n’est pas essentiel. »',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=85',
    content: [
      'Le drapé n’est pas un artifice décoratif ; c’est une négociation intime entre la pesanteur terrestre et la tension moléculaire d’une fibre naturelle. Lorsque Madeleine Vionnet introduisit la coupe en biais au début du siècle dernier, elle ne créa pas seulement une silhouette, elle affranchit le vêtement de son armature rigide.',
      'À la Maison FOEG, chaque coupon de soie est suspendu pendant quarante-huit heures avant d’être effleuré par les ciseaux. Ce repos permet au fil de trouver son équilibre hygrométrique et son élasticité propre. Nous ne forçons jamais un tissu à prendre une forme qui contrarie son fil de chaîne.',
      'Le résultat est une ligne fluide qui accompagne le pas sans flotter, une présence mesurée qui dialogue avec l’espace sans jamais l’encombrer.',
    ],
    translations: {
      es: {
        title: 'El Arte del Drapé',
        subtitle: 'Estudio sobre el movimiento de la seda y la geometría de las caídas',
        excerpt:
          'En el silencio del taller, el tejido no se pliega: se escucha. Cómo el corte al bies libera al cuerpo de toda atadura mecánica.',
        date: '14 de Noviembre de 2026',
        readTime: '5 min de lectura',
        author: 'Dirección Artística FOEG',
        category: 'Saber Hacer',
        pullQuote: '« La verdadera forma nunca resulta de una sobrecarga, sino de la eliminación rigurosa de todo lo que no es esencial. »',
        content: [
          'El drapeado no es un artificio decorativo; es una negociación íntima entre la gravedad terrestre y la tensión molecular de una fibra natural. Cuando Madeleine Vionnet introdujo el corte al bies a principios del siglo pasado, no solo creó una silueta, sino que liberó a la prenda de su armazón rígido.',
          'En Maison FOEG, cada pieza de seda se deja suspendida durante cuarenta y ocho horas antes de que las tijeras la rocen. Este reposo permite que el hilo encuentre su equilibrio higrométrico y su elasticidad natural. Jamás forzamos un tejido a adoptar una forma que contradiga su urdimbre.',
          'El resultado es una línea fluida que acompaña el paso sin flotar, una presencia mesurada que dialoga con el espacio sin sobrecargarlo jamás.',
        ],
      },
      en: {
        title: 'The Art of Draping',
        subtitle: 'Study on the movement of silk and the geometry of drapes',
        excerpt:
          'In the silence of the atelier, fabric does not fold: it listens. How the bias cut frees the body from mechanical constraint.',
        date: 'November 14, 2026',
        readTime: '5 min read',
        author: 'FOEG Artistic Direction',
        category: 'Craftsmanship',
        pullQuote: '“True form never results from excess, but from the rigorous elimination of everything non-essential.”',
        content: [
          'Draping is not a decorative gimmick; it is an intimate negotiation between gravity and the molecular tension of a natural fiber. When Madeleine Vionnet introduced the bias cut at the turn of the last century, she did not merely create a silhouette—she emancipated the garment from its rigid armature.',
          'At Maison FOEG, each length of silk is suspended for forty-eight hours before scissors touch it. This rest period allows the yarn to find its hygrometric equilibrium and natural elasticity. We never force a fabric into a shape that runs counter to its grain.',
          'The result is a fluid line that moves with the stride without drifting, a measured presence that dialogues with space without ever crowding it.',
        ],
      },
    },
  },
  {
    id: 'art-002',
    slug: 'dans-l-atelier-le-cachemire',
    title: "Dans l'Atelier : Le Cachemire",
    subtitle: 'La noblesse des hauts plateaux et la filature bielloise',
    excerpt:
      'De la récolte printanière du duvet sous la gorge des chèvres capra hircus jusqu’au peignage à l’eau de source alpine.',
    date: '02 Novembre 2026',
    readTime: '6 min de lecture',
    author: 'Atelier de Confection',
    category: 'Matières Nobles',
    pullQuote: '« La pureté d’un fil se révèle au toucher : il ne doit ni retenir la main ni glisser avec artifice, mais offrir une chaleur immédiate et vivante. »',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1600&q=85',
    content: [
      'Le cachemire d’exception ne se mesure pas uniquement à son épaisseur, mais à la finesse de son micronage et à la longueur de ses mèches. Seul le duvet le plus immaculé, recueilli à la main lors de la mue printanière, entre dans la composition de nos manteaux.',
      'Filé en Italie dans la région de Biella, réputée pour la pureté minérale de ses eaux, le fil conserve une douceur tactile qui s’enrichit au fil des hivers au lieu de s’émousser.',
      'Chaque manteau requiert près de trente-six heures d’assemblage manuel, où chaque rentré de couture est fendu et rabattu à petits points imperceptibles.',
    ],
    translations: {
      es: {
        title: 'En el Atelier: El Cachemira',
        subtitle: 'La nobleza de las altas mesetas y el hilado en Biella',
        excerpt:
          'Desde la recolección primaveral del plumón bajo la garganta de las cabras capra hircus hasta el peinado con agua de manantial alpino.',
        date: '02 de Noviembre de 2026',
        readTime: '6 min de lectura',
        author: 'Taller de Confección',
        category: 'Materias Nobles',
        pullQuote: '« La pureza de un hilo se revela al tacto: no debe retener la mano ni deslizarse con artificio, sino brindar un calor inmediato y vivo. »',
        content: [
          'El cachemira excepcional no se mide únicamente por su grosor, sino por la finura de su micronaje y la longitud de sus mechas. Solo el plumón más inmaculado, recolectado a mano durante la muda primaveral, entra en la composición de nuestros abrigos.',
          'Hilado en Italia en la región de Biella, célebre por la pureza mineral de sus aguas, el hilo conserva una suavidad táctil que se enriquece con el paso de los inviernos en lugar de desgastarse.',
          'Cada abrigo requiere cerca de treinta y seis horas de ensamblaje manual, donde cada dobladillo es abierto y rematado con pequeñas puntadas imperceptibles.',
        ],
      },
      en: {
        title: 'In the Atelier: Cashmere',
        subtitle: 'The nobility of the high plateaus and Biella spinning',
        excerpt:
          'From the spring harvesting of underfleece from Capra hircus goats to alpine spring-water combing.',
        date: 'November 2, 2026',
        readTime: '6 min read',
        author: 'Confection Atelier',
        category: 'Noble Materials',
        pullQuote: '“The purity of yarn reveals itself to the touch: it must neither grip the hand nor slip with artificiality, but offer an immediate, living warmth.”',
        content: [
          'Exceptional cashmere is not measured solely by thickness, but by the fineness of its micron count and the length of its staple. Only the purest underdown, hand-gathered during the spring molt, enters into our coats.',
          'Spun in Italy in the Biella region, renowned for the mineral purity of its waters, the yarn retains a tactile softness that enriches over the course of winters rather than dulling.',
          'Each coat requires nearly thirty-six hours of manual tailoring, where every interior seam is split and fell-stitched by hand with imperceptible stitches.',
        ],
      },
    },
  },
  {
    id: 'art-003',
    slug: 'paris-6eme-nos-adresses',
    title: 'Paris, 6ème : Nos Adresses',
    subtitle: 'Itinéraire discret entre Saint-Germain-des-Prés et la Seine',
    excerpt:
      'Galeries d’art brut, reliures anciennes et cafés silencieux qui inspirent les collections de la Maison.',
    date: '24 Octobre 2026',
    readTime: '4 min de lecture',
    author: 'Correspondances Parisiennes',
    category: 'Carnet de Ville',
    pullQuote: '« C’est dans les cours pavées et le silence feutré des ateliers oubliés que s’écrit l’élégance intemporelle de Paris. »',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=85',
    content: [
      'Paris possède une géographie secrète qui échappe à la frénésie des boulevards. C’est dans les cours pavées de la rue Bonaparte et sous les arcades du Palais-Royal que bat le véritable cœur de notre esthétique.',
      'Nous aimons les reliures patinées de la rue de Seine, où le cuir de maroquin dialogue avec le papier vergé, rappelant l’importance du grain et du toucher.',
      'S’asseoir au crépuscule face aux quais déserts, observer le tombé d’un pardessus sombre sous la pluie fine : voilà où commence chaque esquisse de FOEG.',
    ],
    translations: {
      es: {
        title: 'París, Distrito 6: Nuestras Direcciones',
        subtitle: 'Itinerario discreto entre Saint-Germain-des-Prés y el Sena',
        excerpt:
          'Galerías de arte puro, encuadernaciones antiguas y cafés silenciosos que inspiran las colecciones de la Maison.',
        date: '24 de Octubre de 2026',
        readTime: '4 min de lectura',
        author: 'Correspondencias Parisinas',
        category: 'Cuaderno de Ciudad',
        pullQuote: '« Es en los patios adoquinados y en el silencio discreto de los talleres olvidados donde se escribe la elegancia intemporal de París. »',
        content: [
          'París posee una geografía secreta que escapa al frenesí de los grandes bulevares. Es en los patios empedrados de la rue Bonaparte y bajo las arcadas del Palais-Royal donde late el verdadero corazón de nuestra estética.',
          'Nos cautivan las encuadernaciones patinadas de la rue de Seine, donde el cuero marroquí dialoga con el papel verjurado, recordando la importancia de la textura y el tacto.',
          'Sentarse al atardecer frente a los muelles desiertos, contemplar la caída de un abrigo oscuro bajo la fina llovizna: ahí comienza cada boceto de FOEG.',
        ],
      },
      en: {
        title: 'Paris, 6th Arr.: Our Addresses',
        subtitle: 'A discreet itinerary between Saint-Germain-des-Prés and the Seine',
        excerpt:
          'Art brut galleries, antique bindings, and quiet cafés that inspire the collections of the Maison.',
        date: 'October 24, 2026',
        readTime: '4 min read',
        author: 'Parisian Notes',
        category: 'City Journal',
        pullQuote: '“It is within the cobbled courtyards and the hushed silence of forgotten ateliers that Paris’s timeless elegance is written.”',
        content: [
          'Paris possesses a secret geography that escapes the frenzy of the grand boulevards. It is within the cobblestone courtyards of Rue Bonaparte and beneath the arcades of the Palais-Royal that the true heart of our aesthetics beats.',
          'We cherish the patinated bindings of Rue de Seine, where morocco leather speaks with laid paper, recalling the essential primacy of grain and touch.',
          'Sitting at dusk before the deserted quays, observing the drape of a dark overcoat under fine rain: that is where every FOEG sketch begins.',
        ],
      },
    },
  },
  {
    id: 'art-004',
    slug: 'la-philosophie-du-silence',
    title: 'La Philosophie du Silence',
    subtitle: 'Pourquoi le vrai luxe n’éprouve jamais le besoin de crier',
    excerpt:
      'Dans une époque saturée de logos et d’hyper-visibilité, l’effacement délibéré devient l’ultime marque de distinction.',
    date: '12 Octobre 2026',
    readTime: '7 min de lecture',
    author: 'Édition FOEG',
    category: 'Manifeste',
    pullQuote: '« Le luxe véritable est une présence mesurée qui n’a besoin d’aucun logo pour affirmer son autorité. »',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=85',
    content: [
      'Le luxe tapageur est une contradiction dans les termes. Dès lors qu’un vêtement cherche à prouver son statut par l’ostentation d’un monogramme, il renonce à sa propre noblesse intrinsèque.',
      'La philosophie de FOEG repose sur la certitude que celui qui porte la pièce et celui qui sait la regarder partagent un langage secret : la tension d’une étoffe, l’alignement microscopique d’un motif, la discrétion d’un bouton cousu à la main.',
      'Ce silence n’est pas une absence, mais une plénitude. Une élégance qui s’impose sans bruit.',
    ],
    translations: {
      es: {
        title: 'La Filosofía del Silencio',
        subtitle: 'Por qué el verdadero lujo nunca siente la necesidad de gritar',
        excerpt:
          'En una época saturada de logotipos e hipervisibilidad, la discreción deliberada se convierte en la máxima seña de distinción.',
        date: '12 de Octubre de 2026',
        readTime: '7 min de lectura',
        author: 'Edición FOEG',
        category: 'Manifiesto',
        pullQuote: '« El verdadero lujo es una presencia mesurada que no necesita ningún logotipo para afirmar su autoridad. »',
        content: [
          'El lujo estridente es una contradicción en sí misma. Desde el momento en que una prenda busca demostrar estatus mediante la ostentación de un monograma, renuncia a su propia nobleza intrínseca.',
          'La filosofía de FOEG descansa en la certeza de que quien viste la pieza y quien sabe apreciarla comparten un lenguaje secreto: la caída de un tejido, la alineación microscópica de un patrón, la sutileza de un botón cosido a mano.',
          'Este silencio no es una carencia, sino una plenitud. Una elegancia que se impone sin hacer ruido.',
        ],
      },
      en: {
        title: 'The Philosophy of Silence',
        subtitle: 'Why true luxury never feels the need to shout',
        excerpt:
          'In an era saturated with logos and hyper-visibility, deliberate understatement becomes the ultimate mark of distinction.',
        date: 'October 12, 2026',
        readTime: '7 min read',
        author: 'FOEG Edition',
        category: 'Manifesto',
        pullQuote: '“True luxury is a measured presence that needs no logo to assert its authority.”',
        content: [
          'Loud luxury is a contradiction in terms. The moment a garment attempts to prove its status through the ostentation of a monogram, it forfeits its own intrinsic nobility.',
          'The philosophy of FOEG rests upon the certainty that the wearer of the piece and the discerning observer share a secret language: the drape of a cloth, the microscopic alignment of a weave, the subtlety of a hand-sewn button.',
          'This silence is not an absence, but a fullness. An elegance that asserts itself without noise.',
        ],
      },
    },
  },
];

export function getLocalizedJournalArticle(
  article: JournalArticle,
  lang: string
): JournalArticle {
  const builtIn = JOURNAL_ARTICLES.find(
    (a) => a.id === article.id || a.slug === article.slug
  );
  const translations = article.translations || builtIn?.translations;

  if (lang === 'es' && translations?.es) {
    const t = translations.es;
    return {
      ...article,
      title: t.title || article.title,
      subtitle: t.subtitle || article.subtitle,
      excerpt: t.excerpt || article.excerpt,
      content: t.content || article.content,
      date: t.date || article.date,
      readTime: t.readTime || article.readTime,
      author: t.author || article.author,
      category: t.category || article.category,
      pullQuote: t.pullQuote || article.pullQuote,
    };
  }

  if (lang === 'en' && translations?.en) {
    const t = translations.en;
    return {
      ...article,
      title: t.title || article.title,
      subtitle: t.subtitle || article.subtitle,
      excerpt: t.excerpt || article.excerpt,
      content: t.content || article.content,
      date: t.date || article.date,
      readTime: t.readTime || article.readTime,
      author: t.author || article.author,
      category: t.category || article.category,
      pullQuote: t.pullQuote || article.pullQuote,
    };
  }

  return article;
}

export function getArticleBySlug(slug: string): JournalArticle | undefined {
  return JOURNAL_ARTICLES.find((a) => a.slug === slug);
}

export function getAllArticles(): JournalArticle[] {
  return JOURNAL_ARTICLES;
}
