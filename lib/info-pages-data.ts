export interface InfoPageContent {
  title: string;
  subtitle: string;
  category: string;
  content: string[];
}

export type InfoLanguage = 'fr' | 'en' | 'es';

export const INFO_PAGES_MULTILINGUAL: Record<InfoLanguage, Record<string, InfoPageContent>> = {
  fr: {
    contacto: {
      title: 'Contact & Rendez-vous Atelier Privé',
      subtitle: 'Service Conciergerie · rue Lucien Sampaix, Paris 75010',
      category: 'Service Client',
      content: [
        'Notre conciergerie privée vous accueille du lundi au samedi pour une séance d’essayage personnalisée au cœur de notre atelier parisien.',
        'Pour toute demande sur mesure, commande spéciale ou question concernant nos collections, notre équipe de conseillers stylistiques se tient à votre entière disposition.',
        'Courriel confidentiel : concierge@foeg-paris.com\nTéléphone de la Maison : +33 1 42 68 55 00\nHoraires : Du lundi au samedi, 10h00 — 19h00 (Heure de Paris).',
      ],
    },
    envios: {
      title: 'Livraisons & Expéditions Spéciales',
      subtitle: 'Écrins rigides scellés et transport sécurisé sous signature',
      category: 'Service Client',
      content: [
        'Chaque création FOEG est minutieusement pliée dans un papier de soie gaufré non acide et déposée dans un coffret signature rigide, accompagné d’une housse de protection en coton biologique certifié et d’un cintre en cèdre.',
        'Livraison offerte en France Métropolitaine et en Union Européenne pour toute commande supérieure au seuil d’atelier. Nos expéditions sont opérées en partenariat avec des coursiers spécialisés garantissant une remise contre signature sécurisée sous 24 à 48 heures ouvrées.',
        'Livraison Internationale : Europe (2 à 3 jours ouvrés), États-Unis, Canada, Asie et Amériques (3 à 5 jours ouvrés via DHL Express avec dédouanement prioritaire inclus).',
      ],
    },
    devoluciones: {
      title: 'Échanges & Retours de Précision',
      subtitle: '30 jours pour apprécier la justesse de nos coupes et tombés',
      category: 'Service Client',
      content: [
        'Si une pièce ne correspondait pas parfaitement à vos exigences, la Maison FOEG vous accorde un délai de 30 jours à compter de la réception de votre coffret pour initier un retour gracieux ou demander un échange de taille.',
        'Les articles doivent être retournés dans leur état d’origine, non portés, non retouchés et munis de l’ensemble de leurs scellés et étiquettes d’atelier intactes.',
        'Une étiquette d’expédition prépayée sécurisée est mise à votre disposition sur simple demande auprès de notre conciergerie ou depuis votre compte client.',
      ],
    },
    'guia-tallas': {
      title: 'Guide des Tailles & Coupe',
      subtitle: 'L’art du tombé architectural et de l’aisance naturelle',
      category: 'Service Client',
      content: [
        'Les créations FOEG sont taillées selon les standards de la haute parure parisienne, privilégiant une aisance fluide et des lignes épurées qui subliment le mouvement sans entraver la silhouette.',
        'Taille XS (34 FR) : Poitrine 80-84 cm | Taille 62-66 cm | Hanches 88-92 cm\nTaille S (36 FR) : Poitrine 84-88 cm | Taille 66-70 cm | Hanches 92-96 cm\nTaille M (38-40 FR) : Poitrine 90-94 cm | Taille 72-76 cm | Hanches 98-102 cm\nTaille L (42 FR) : Poitrine 96-102 cm | Taille 78-84 cm | Hanches 104-110 cm',
        'Si vous hésitez entre deux statures, nos tailleurs préconisent d’opter pour votre taille habituelle afin de préserver l’intention de la coupe originale.',
      ],
    },
    'cuidado-prendas': {
      title: 'Soin des Matières Nobles',
      subtitle: 'Pérenniser la beauté du cachemire, de la soie et des laines vierges',
      category: 'Service Client',
      content: [
        'Nos textiles naturels d’exception possèdent une longévité remarquable dès lors qu’ils bénéficient d’un entretien attentif et mesuré.',
        'Le Cachemire : Laissez reposer votre maille au moins 24 heures entre deux ports afin que les fibres reprennent leur gonflant originel. Aérez à l’air libre sur cintre large en cèdre et confiez le nettoyage à sec à un maître teinturier spécialisé.',
        'La Soie de Mûrier : Repassage toujours sur l’envers à fer tiède et sans vapeur directe. Conserver suspendu à l’abri de la lumière solaire prolongée.',
      ],
    },
    manifiesto: {
      title: 'Manifeste FOEG Paris',
      subtitle: 'L’Éloge de la Discrétion, de l’Épure et du Temps Long',
      category: 'La Maison',
      content: [
        'Dans un monde saturé de logos ostentatoires et de rythmes éphémères, la Maison FOEG fait le choix radical du silence.',
        'Nous croyons en un vestiaire réduit à l’essentiel : des coupes architecturales impeccables, des drapés d’une pureté absolue et les matières les plus précieuses que l’artisanat européen puisse façonner.',
        'Le véritable luxe ne cherche pas à être vu. Il se ressent au toucher, s’éprouve dans la durée et procure une assurance calme et inaltérable à celle et celui qui le porte.',
      ],
    },
    ateliers: {
      title: 'Savoir-Faire & Ateliers Partenaires',
      subtitle: 'La transmission vivante des gestes d’exception à Paris et Biella',
      category: 'La Maison',
      content: [
        'De la sélection des toisons de cachemire mongoles peignées à la main jusqu’au tissage dans les ateliers séculaires de la région de Biella en Italie, chaque étape répond à une exigence sans compromis.',
        'Nos patronages et finitions à la main sont exécutés au cœur de Paris par des artisans tailleurs perpétuant un savoir-faire d’atelier d’une précision millimétrique.',
        'Chaque couture invisible, chaque bouton de nacre naturelle monté sous patte et chaque doublure respirante témoignent d’un engagement total pour la pérennité.',
      ],
    },
    sostenibilidad: {
      title: 'Traçabilité & Matières Nobles',
      subtitle: 'Fibres 100% responsables, traçabilité intégrale et zéro surproduction',
      category: 'La Maison',
      content: [
        'La Maison FOEG s’affranchit du calendrier traditionnel de la mode rapide. Nous éditons des séries strictement limitées pour éliminer tout gaspillage de tissu noble.',
        '100% de nos laines, cachemires et soies proviennent de filières certifiées garantissant le bien-être animal, la régénération des pâturages et des conditions de travail justes.',
        'Aucun plastique, aucune fibre synthétique superflue. Nos emballages sont entièrement biodégradables, recyclables et certifiés FSC.',
      ],
    },
    trazabilidad: {
      title: 'Traçabilité & Matières Nobles',
      subtitle: 'Fibres 100% responsables, traçabilité intégrale et zéro surproduction',
      category: 'La Maison',
      content: [
        'La Maison FOEG s’affranchit du calendrier traditionnel de la mode rapide. Nous éditons des séries strictement limitées pour éliminer tout gaspillage de tissu noble.',
        '100% de nos laines, cachemires et soies proviennent de filières certifiées garantissant le bien-être animal, la régénération des pâturages et des conditions de travail justes.',
        'Aucun plastique, aucune fibre synthétique superflue. Nos emballages sont entièrement biodégradables, recyclables et certifiés FSC.',
      ],
    },
    carreras: {
      title: 'Opportunités & Talents de l’Atelier',
      subtitle: 'Rejoindre la Maison FOEG Paris',
      category: 'La Maison',
      content: [
        'Nous recherchons en permanence des artisans, modélistes et passionnés de l’épure qui partagent notre dévouement pour le travail bien fait.',
        'Pour soumettre votre portfolio ou candidature spontanée, adressez votre dossier à : talents@foeg-paris.com.',
      ],
    },
    oportunidades: {
      title: 'Opportunités & Talents de l’Atelier',
      subtitle: 'Rejoindre la Maison FOEG Paris',
      category: 'La Maison',
      content: [
        'Nous recherchons en permanence des artisans, modélistes et passionnés de l’épure qui partagent notre dévouement pour le travail bien fait.',
        'Pour soumettre votre portfolio ou candidature spontanée, adressez votre dossier à : talents@foeg-paris.com.',
      ],
    },
    terminos: {
      title: 'Conditions Générales de Vente',
      subtitle: 'Cadre juridique officiel et engagements de la Maison FOEG Paris',
      category: 'Légal',
      content: [
        'Les présentes conditions générales régissent l’ensemble des transactions conclues sur le site officiel de la Maison FOEG (Paris, France).',
        'Toutes les commandes sont sous réserve d’acceptation et de disponibilité dans nos ateliers. Les prix sont affichés en Euros (€) ou Dollars US ($) selon votre devise choisie, toutes taxes comprises.',
        'Le paiement est exigible immédiatement lors de la confirmation de commande via nos protocoles de chiffrement bancaire sécurisé TLS 256-bit.',
      ],
    },
    privacidad: {
      title: 'Politique de Confidentialité',
      subtitle: 'Protection absolue et confidentialité de vos données personnelles',
      category: 'Légal',
      content: [
        'La Maison FOEG s’engage à préserver la confidentialité totale des informations transmises par ses membres et clients.',
        'Vos données personnelles ne font l’objet d’aucune cession, vente ou échange auprès de prestataires tiers à des fins publicitaires.',
        'Conformément au RGPD européen, vous disposez d’un droit d’accès, de rectification et d’effacement permanent de vos données sur simple demande à concierge@foeg-paris.com.',
      ],
    },
    cookies: {
      title: 'Gestion des Cookies & Traceurs',
      subtitle: 'Transparence et respect rigoureux de votre navigation',
      category: 'Légal',
      content: [
        'Nous utilisons uniquement les témoins de navigation indispensables à la sécurité du panier d’achat et à la mémorisation de vos préférences linguistiques et monétaires.',
        'Vous pouvez à tout moment configurer ou révoquer vos consentements depuis le lien de gestion des cookies situé dans le pied de page de notre boutique.',
      ],
    },
    'aviso-legal': {
      title: 'Avis Légal & Mentions Réglementaires',
      subtitle: 'Informations juridiques relatives à l’éditeur de la Maison FOEG',
      category: 'Légal',
      content: [
        'Éditeur : Maison FOEG Paris SAS — Société au capital social de 50.000 €\nSiège social : 48 Rue Lucien Sampaix, 75010 Paris, France\nImmatriculation : RCS Paris B 912 345 678 · TVA Intracommunautaire : FR 32 894123456\nDirecteur de la publication : Direction Générale FOEG\nHébergement : Infrastructure cloud haute sécurité Neon PostgreSQL & Vercel.',
      ],
    },
    accesibilidad: {
      title: 'Déclaration d’Accessibilité',
      subtitle: 'Un design épuré, contrasté et lisible par tous',
      category: 'Légal',
      content: [
        'La Maison FOEG s’engage à rendre son expérience numérique accessible au plus grand nombre, dans le respect des recommandations internationales WCAG 2.1 niveau AA.',
        'Notre charte graphique repose sur des contrastes stricts (#0A0A0A sur fond clair), une navigation clavier fluide et la compatibilité totale avec les technologies d’assistance et lecteurs d’écran.',
      ],
    },
    faq: {
      title: 'Questions Fréquentes & Conciergerie',
      subtitle: 'Tout ce que vous devez savoir sur nos confections, commandes et livraisons',
      category: 'Service Client',
      content: [
        'Où sont confectionnées les pièces FOEG ?\nToutes nos créations sont imaginées à Paris et façonnées en séries limitées dans nos ateliers partenaires sélectionnés pour leur savoir-faire d’exception en France et en Italie.',
        'Quels sont les délais et modes de livraison ?\nNous expédions en France Métropolitaine sous 24 à 48 heures ouvrées via coursier sécurisé avec signature. Pour l’Union Européenne, comptez 2 à 3 jours ouvrés, et 3 à 5 jours ouvrés pour les envois internationaux avec DHL Express (dédouanement prioritaire inclus).',
        'Quelle est votre politique de retours et d’échanges ?\nVous disposez de 30 jours à compter de la réception de votre colis pour essayer votre pièce et demander un retour gracieux ou un échange de taille.',
        'Comment prendre rendez-vous pour un essayage privé ?\nNotre salon privé situé rue Lucien Sampaix à Paris vous accueille sur réservation du lundi au samedi. Vous pouvez convenir d’une date en écrivant à concierge@foeg-paris.com.',
        'Quels sont les modes de règlement acceptés ?\nNous acceptons les cartes de crédit internationales via Stripe, Apple Pay, PayPal, ainsi que les virements instantanés SEPA et devises pour les membres de notre Cercle Privé.',
      ],
    },
  },
  es: {
    contacto: {
      title: 'Contacto y Cita en Atelier',
      subtitle: 'Servicio de Conserjería Privada · rue Lucien Sampaix, París 75010',
      category: 'Servicio al Cliente',
      content: [
        'Nuestra conserjería privada le da la bienvenida de lunes a sábado para una sesión de prueba personalizada en el corazón de nuestro atelier parisino.',
        'Para cualquier solicitud a medida, confección especial o consultas sobre nuestras colecciones, nuestro equipo de asesores de alta costura permanece a su entera disposición.',
        'Correo confidencial: concierge@foeg-paris.com\nTeléfono institucional: +33 1 42 68 55 00\nHorarios de atención: De lunes a sábado, 10:00 — 19:00 (Hora de París CET).',
      ],
    },
    envios: {
      title: 'Envíos y Entregas Especiales',
      subtitle: 'Estuches rígidos sellados y transporte de alta seguridad con firma',
      category: 'Servicio al Cliente',
      content: [
        'Cada creación FOEG es cuidadosamente doblada en papel de seda gofrado sin ácido y resguardada en una caja rígida insignia, acompañada de una funda de viaje en algodón orgánico y percha de cedro.',
        'Envío con firma de cortesía en Francia y Unión Europea a partir del umbral oficial de taller. Nuestros envíos se realizan con transportistas de élite que garantizan entrega bajo firma en 24 a 48 horas laborables.',
        'Envíos Internacionales: Europa (2 a 3 días hábiles), Estados Unidos, Canadá, Latinoamérica y Asia (3 a 5 días hábiles mediante DHL Express con gestión aduanera prioritaria).',
      ],
    },
    devoluciones: {
      title: 'Cambios y Devoluciones',
      subtitle: '30 días para apreciar la precisión de nuestro calce y caída',
      category: 'Servicio al Cliente',
      content: [
        'Si una prenda no cumple plenamente con sus expectativas, la Maison FOEG le otorga un plazo de 30 días naturales desde la entrega para solicitar un cambio de talla o devolución sin costo adicional.',
        'Las prendas deben ser devueltas en su estado original, no usadas, no modificadas y con todos sus sellos de taller y etiquetas intactas.',
        'Puede solicitar su etiqueta de envío prepagada directamente a nuestra conserjería o gestionarla desde su área privada de cliente.',
      ],
    },
    'guia-tallas': {
      title: 'Guía de Tallas y Calce',
      subtitle: 'El arte de la caída arquitectónica y la libertad de movimiento',
      category: 'Servicio al Cliente',
      content: [
        'Las creaciones FOEG se confeccionan según los rigurosos estándares de la sastrería parisina, priorizando una silueta limpia y proporcionada que acompaña el movimiento natural del cuerpo.',
        'Talla XS (34 FR): Pecho 80-84 cm | Cintura 62-66 cm | Cadera 88-92 cm\nTalla S (36 FR): Pecho 84-88 cm | Cintura 66-70 cm | Cadera 92-96 cm\nTalla M (38-40 FR): Pecho 90-94 cm | Cintura 72-76 cm | Cadera 98-102 cm\nTalla L (42 FR): Pecho 96-102 cm | Cintura 78-84 cm | Cadera 104-110 cm',
        'Si duda entre dos tallas, nuestros maestros sastres recomiendan optar por su talla habitual para preservar el diseño y la caída original de la prenda.',
      ],
    },
    'cuidado-prendas': {
      title: 'Cuidado de Materiales Nobles',
      subtitle: 'Preservar la longevidad y suavidad del cachemira, la seda y las lanas vírgenes',
      category: 'Servicio al Cliente',
      content: [
        'Nuestros tejidos naturales poseen una longevidad excepcional cuando reciben un cuidado medido y respetuoso.',
        'Cachemira: Deje reposar la prenda de punto al menos 24 horas entre usos para que las fibras recuperen su volumen natural. Airee en percha de madera de cedro y confíe la limpieza en seco a un maestro tintorero especializado.',
        'Seda de Morera: Planche siempre del revés a baja temperatura y sin vapor directo. Conserve la prenda colgada y protegida de la luz solar directa prolongada.',
      ],
    },
    manifiesto: {
      title: 'Manifiesto FOEG',
      subtitle: 'Elogio de la discreción, la pureza y la permanencia',
      category: 'La Marca',
      content: [
        'En un mundo saturado de logotipos ostentosos y tendencias pasajeras, la Maison FOEG elige el camino del silencio y la elegancia perdurable.',
        'Creemos en un guardarropa esencial: cortes arquitectónicos impecables, caídas de absoluta pureza y las materias primas más nobles que los talleres europeos pueden confeccionar.',
        'El verdadero lujo no necesita llamar la atención. Se reconoce al tacto, se confirma con el paso del tiempo y transmite una confianza serena a quien lo viste.',
      ],
    },
    ateliers: {
      title: 'Savoir-Faire y Talleres',
      subtitle: 'La transmisión viva del oficio sastre entre París y Biella',
      category: 'La Marca',
      content: [
        'Desde la selección de vellones de cachemira mongol peinados a mano hasta el hilado en tejedurías históricas de la región de Biella en Italia, cada paso responde a una exigencia sin concesiones.',
        'Nuestros patrones y acabados a mano se ejecutan en el corazón de París por artesanos sastres que perpetúan una tradición de precisión milimétrica.',
        'Cada costura oculta, cada botón de nácar natural cosido a mano y cada forro transpirable reflejan nuestro compromiso absoluto con la durabilidad.',
      ],
    },
    sostenibilidad: {
      title: 'Trazabilidad y Materias',
      subtitle: 'Fibras 100% naturales, abastecimiento ético y cero sobreproducción',
      category: 'La Marca',
      content: [
        'Maison FOEG no sigue los calendarios efímeros de la moda rápida. Producimos en series estrictamente limitadas para eliminar el desperdicio de tejidos nobles.',
        'El 100% de nuestras lanas, sedas y cachemiras provienen de fuentes certificadas que garantizan el bienestar animal, la regeneración del suelo y condiciones laborales justas.',
        'Sin plásticos ni fibras sintéticas superfluas. Nuestros empaques son completamente biodegradables, reciclables y con certificación forestal FSC.',
      ],
    },
    trazabilidad: {
      title: 'Trazabilidad y Materias',
      subtitle: 'Fibras 100% naturales, abastecimiento ético y cero sobreproducción',
      category: 'La Marca',
      content: [
        'Maison FOEG no sigue los calendarios efímeros de la moda rápida. Producimos en series estrictamente limitadas para eliminar el desperdicio de tejidos nobles.',
        'El 100% de nuestras lanas, sedas y cachemiras provienen de fuentes certificadas que garantizan el bienestar animal, la regeneración del suelo y condiciones laborales justas.',
        'Sin plásticos ni fibras sintéticas superfluas. Nuestros empaques son completamente biodegradables, reciclables y con certificación forestal FSC.',
      ],
    },
    carreras: {
      title: 'Oportunidades',
      subtitle: 'Únase al equipo de la Maison FOEG Paris',
      category: 'La Marca',
      content: [
        'Buscamos constantemente artesanos, patronistas y profesionales apasionados por la confección refinada y el trabajo bien hecho.',
        'Para enviar su portafolio o postulación espontánea, escriba a: talents@foeg-paris.com.',
      ],
    },
    oportunidades: {
      title: 'Oportunidades',
      subtitle: 'Únase al equipo de la Maison FOEG Paris',
      category: 'La Marca',
      content: [
        'Buscamos constantemente artesanos, patronistas y profesionales apasionados por la confección refinada y el trabajo bien hecho.',
        'Para enviar su portafolio o postulación espontánea, escriba a: talents@foeg-paris.com.',
      ],
    },
    terminos: {
      title: 'Términos de Servicio',
      subtitle: 'Marco legal oficial y condiciones comerciales de Maison FOEG Paris',
      category: 'Legal',
      content: [
        'Las presentes condiciones generales regulan todas las transacciones realizadas en la boutique oficial de Maison FOEG (París, Francia).',
        'Todos los pedidos están sujetos a confirmación y disponibilidad en nuestros talleres. Los precios se expresan en Euros (€) o Dólares US ($) según la divisa seleccionada, con los impuestos aplicables incluidos.',
        'El pago es exigible de forma inmediata al confirmar la orden mediante pasarelas de pago certificadas con cifrado bancario TLS 256-bit.',
      ],
    },
    privacidad: {
      title: 'Política de Privacidad',
      subtitle: 'Protección absoluta y confidencialidad de sus datos personales',
      category: 'Legal',
      content: [
        'Maison FOEG se compromete a salvaguardar rigurosamente la privacidad de los datos compartidos por sus clientes y miembros.',
        'Sus datos personales nunca serán vendidos, cedidos ni compartidos con terceros para fines comerciales o publicitarios.',
        'Conforme a la normativa europea de protección de datos (RGPD), usted tiene derecho al acceso, rectificación y supresión de sus datos en cualquier momento escribiendo a concierge@foeg-paris.com.',
      ],
    },
    cookies: {
      title: 'Política de Cookies',
      subtitle: 'Transparencia y respeto estricto a su experiencia de navegación',
      category: 'Legal',
      content: [
        'Utilizamos únicamente las cookies técnicas indispensables para el funcionamiento del carrito de compras y la conservación de sus preferencias de idioma y moneda.',
        'En cualquier momento puede ajustar o revocar sus preferencias desde el enlace de Gestión de Cookies ubicado en el pie de página de la boutique.',
      ],
    },
    'aviso-legal': {
      title: 'Aviso Legal',
      subtitle: 'Información societaria y regulatoria sobre el editor de FOEG',
      category: 'Legal',
      content: [
        'Editor: Maison FOEG Paris SAS — Capital social de 50.000 €\nSede central: 48 Rue Lucien Sampaix, 75010 París, Francia\nRegistro mercantil: RCS Paris B 912 345 678 · N° IVA Intracomunitario: FR 32 894123456\nDirección de la publicación: Dirección General FOEG Paris\nAlojamiento web: Servidores en la nube de alta seguridad Neon PostgreSQL y Vercel.',
      ],
    },
    accesibilidad: {
      title: 'Declaración de Accesibilidad',
      subtitle: 'Un diseño sobrio, contrastado y accesible para todos',
      category: 'Legal',
      content: [
        'Maison FOEG tiene el compromiso de ofrecer una experiencia digital accesible para todos los usuarios, respetando las pautas internacionales de accesibilidad WCAG 2.1 nivel AA.',
        'Nuestra interfaz incorpora altos contrastes de legibilidad, navegación estructurada mediante teclado y compatibilidad integral con lectores de pantalla.',
      ],
    },
    faq: {
      title: 'Preguntas Frecuentes (FAQ)',
      subtitle: 'Respuestas a sus dudas sobre confección, pedidos, envíos y visitas al taller',
      category: 'Servicio al Cliente',
      content: [
        '¿Dónde se confeccionan las piezas de FOEG?\nTodas nuestras creaciones se diseñan en París y se elaboran en series limitadas en talleres asociados de Francia e Italia reconocidos por su maestría artesanal.',
        '¿Cuáles son los plazos y formas de envío?\nEnviamos a Francia y Europa en 24 a 48 horas con entrega bajo firma. Para envíos internacionales a Estados Unidos y Latinoamérica, el plazo habitual es de 3 a 5 días laborables mediante DHL Express con gestión aduanera incluida.',
        '¿Cuál es la política de cambios y devoluciones?\nDispone de 30 días naturales desde la recepción de su paquete para probarse las prendas y solicitar un cambio de talla o devolución de cortesía.',
        '¿Cómo concertar una cita en el taller de París?\nNuestro salón privado de Rue Lucien Sampaix en París le atiende bajo cita previa de lunes a sábado. Puede reservar su sesión escribiendo a concierge@foeg-paris.com.',
        '¿Qué métodos de pago son admitidos?\nAceptamos tarjetas bancarias internacionales vía Stripe, Apple Pay, PayPal, transferencias SEPA y opciones locales habilitadas para nuestro Círculo Privado.',
      ],
    },
  },
  en: {
    contacto: {
      title: 'Contact & Private Atelier Appointment',
      subtitle: 'Private Concierge Service · rue Lucien Sampaix, Paris 75010',
      category: 'Client Care',
      content: [
        'Our private concierge welcomes you from Monday to Saturday for a bespoke fitting session at our Parisian atelier.',
        'For bespoke tailoring requests, custom orders, or collection inquiries, our styling advisors are entirely at your disposal.',
        'Confidential email: concierge@foeg-paris.com\nInstitutional phone: +33 1 42 68 55 00\nOpening hours: Monday to Saturday, 10:00 — 19:00 (Paris Time CET).',
      ],
    },
    envios: {
      title: 'Shipping & Special Deliveries',
      subtitle: 'Reinforced signature presentation boxes and insured courier delivery',
      category: 'Client Care',
      content: [
        'Every FOEG creation is carefully folded in acid-free tissue paper and enclosed in our signature rigid box, accompanied by a certified organic cotton garment cover and cedarwood hanger.',
        'Complimentary signature delivery in Metropolitan France and the European Union for orders above the atelier threshold. Shipments are handled with premier couriers guaranteeing delivery with signature within 24 to 48 business hours.',
        'International Shipping: Europe (2 to 3 business days), United States, Canada, the Americas, and Asia (3 to 5 business days via DHL Express with priority customs clearance included).',
      ],
    },
    devoluciones: {
      title: 'Exchanges & Returns',
      subtitle: '30 days to experience the precision of our silhouettes and draping',
      category: 'Client Care',
      content: [
        'Should any piece fail to meet your exacting standards, Maison FOEG grants you 30 days from receipt to initiate a complimentary return or request a size exchange.',
        'Items must be returned in their original condition, unworn, unaltered, and with all atelier security seals and tags intact.',
        'A prepaid insured shipping label can be requested directly from our concierge or generated within your personal client account.',
      ],
    },
    'guia-tallas': {
      title: 'Size Guide & Fit',
      subtitle: 'The craft of architectural drape and natural ease of movement',
      category: 'Client Care',
      content: [
        'FOEG garments are tailored according to Parisian haute couture standards, focusing on fluid drape and clean architectural lines that celebrate movement without restricting the silhouette.',
        'Size XS (34 FR): Chest 80-84 cm | Waist 62-66 cm | Hips 88-92 cm\nSize S (36 FR): Chest 84-88 cm | Waist 66-70 cm | Hips 92-96 cm\nSize M (38-40 FR): Chest 90-94 cm | Waist 72-76 cm | Hips 98-102 cm\nSize L (42 FR): Chest 96-102 cm | Waist 78-84 cm | Hips 104-110 cm',
        'If you hesitate between two sizes, our master tailors recommend selecting your regular size to maintain the intended silhouette of the original design.',
      ],
    },
    'cuidado-prendas': {
      title: 'Care for Noble Materials',
      subtitle: 'Preserving the beauty of cashmere, silk, and virgin wools',
      category: 'Client Care',
      content: [
        'Our exceptional natural textiles enjoy remarkable longevity when provided with attentive and mindful care.',
        'Cashmere: Allow knitwear to rest for at least 24 hours between wearings to allow fibers to recover their natural loft. Air on a wide cedarwood hanger and entrust dry cleaning to a master specialist.',
        'Mulberry Silk: Always iron inside out at a gentle temperature without direct steam. Store hung away from prolonged direct sunlight.',
      ],
    },
    manifiesto: {
      title: 'FOEG Manifesto',
      subtitle: 'In praise of discretion, essential lines, and enduring luxury',
      category: 'The Maison',
      content: [
        'In a world overwhelmed by ostentatious branding and ephemeral trends, Maison FOEG makes the radical choice of silence.',
        'We believe in a wardrobe pared down to essentials: impeccable architectural tailoring, purist draping, and the noblest fibers European craftsmanship can shape.',
        'True luxury has no need to announce itself. It is felt in the hand, proven over time, and imparts quiet confidence to those who wear it.',
      ],
    },
    ateliers: {
      title: 'Savoir-Faire & Ateliers',
      subtitle: 'The living tradition of master tailors across Paris and Biella',
      category: 'The Maison',
      content: [
        'From hand-combed Mongolian cashmere fleeces to weaving in historic mills in the Biella region of Italy, every step adheres to uncompromising standards.',
        'Our patterns and hand-finishing are executed in the heart of Paris by master tailors maintaining millimetric precision.',
        'Every invisible seam, hand-sewn genuine mother-of-pearl button, and breathable lining stands as testament to our commitment to permanence.',
      ],
    },
    sostenibilidad: {
      title: 'Traceability & Materials',
      subtitle: '100% natural fibers, ethical sourcing, and zero overproduction',
      category: 'The Maison',
      content: [
        'Maison FOEG stands free from fast fashion calendars. We produce strictly limited series to eliminate luxury textile waste.',
        '100% of our wools, cashmeres, and silks come from certified origins that guarantee animal welfare, pasture regeneration, and fair working standards.',
        'No plastics, no superfluous synthetic fibers. Our packaging is entirely biodegradable, recyclable, and FSC certified.',
      ],
    },
    trazabilidad: {
      title: 'Traceability & Materials',
      subtitle: '100% natural fibers, ethical sourcing, and zero overproduction',
      category: 'The Maison',
      content: [
        'Maison FOEG stands free from fast fashion calendars. We produce strictly limited series to eliminate luxury textile waste.',
        '100% of our wools, cashmeres, and silks come from certified origins that guarantee animal welfare, pasture regeneration, and fair working standards.',
        'No plastics, no superfluous synthetic fibers. Our packaging is entirely biodegradable, recyclable, and FSC certified.',
      ],
    },
    carreras: {
      title: 'Careers & Atelier Opportunities',
      subtitle: 'Join the team at Maison FOEG Paris',
      category: 'The Maison',
      content: [
        'We are continually seeking artisans, patternmakers, and purists who share our dedication to fine craftsmanship.',
        'To submit your portfolio or speculative application, please write to: talents@foeg-paris.com.',
      ],
    },
    oportunidades: {
      title: 'Careers & Atelier Opportunities',
      subtitle: 'Join the team at Maison FOEG Paris',
      category: 'The Maison',
      content: [
        'We are continually seeking artisans, patternmakers, and purists who share our dedication to fine craftsmanship.',
        'To submit your portfolio or speculative application, please write to: talents@foeg-paris.com.',
      ],
    },
    terminos: {
      title: 'Terms of Service',
      subtitle: 'Official legal terms and commercial framework of Maison FOEG Paris',
      category: 'Legal',
      content: [
        'These terms and conditions govern all transactions concluded on the official boutique of Maison FOEG (Paris, France).',
        'All orders are subject to confirmation and workshop availability. Prices are displayed in Euros (€) or US Dollars ($) according to your currency preference, inclusive of applicable taxes.',
        'Payment is due upon order confirmation via certified TLS 256-bit encrypted gateways.',
      ],
    },
    privacidad: {
      title: 'Privacy Policy',
      subtitle: 'Absolute protection and confidentiality of your personal information',
      category: 'Legal',
      content: [
        'Maison FOEG is committed to preserving the complete privacy of information entrusted to us by our clients and members.',
        'Your personal details will never be sold, leased, or shared with third parties for commercial or advertising purposes.',
        'In accordance with the European GDPR, you have the right to access, rectify, and delete your data at any time by contacting concierge@foeg-paris.com.',
      ],
    },
    cookies: {
      title: 'Cookie Policy',
      subtitle: 'Transparency and strict respect for your browsing experience',
      category: 'Legal',
      content: [
        'We solely employ essential cookies necessary for secure cart operation and for remembering your currency and language preferences.',
        'You may configure or revoke your consent at any time via the Cookie Preferences link in our store footer.',
      ],
    },
    'aviso-legal': {
      title: 'Legal Notices',
      subtitle: 'Regulatory and corporate information concerning FOEG Paris',
      category: 'Legal',
      content: [
        'Publisher: Maison FOEG Paris SAS — Share capital of €50,000\nHeadquarters: 48 Rue Lucien Sampaix, 75010 Paris, France\nRegistration: Paris Commercial Registry RCS B 912 345 678 · VAT No: FR 32 894123456\nEditorial Director: Executive Management, FOEG Paris\nHosting: High-security cloud infrastructure Neon PostgreSQL & Vercel.',
      ],
    },
    accesibilidad: {
      title: 'Accessibility Statement',
      subtitle: 'An uncluttered, legible, and contrasted digital experience for all',
      category: 'Legal',
      content: [
        'Maison FOEG is committed to providing an accessible digital experience for all visitors, observing international WCAG 2.1 level AA guidelines.',
        'Our design standards maintain strict contrast ratios, structured keyboard navigation, and full compatibility with assistive screen readers.',
      ],
    },
    faq: {
      title: 'Frequently Asked Questions (FAQ)',
      subtitle: 'Everything you need to know about our craftsmanship, ordering, and deliveries',
      category: 'Client Care',
      content: [
        'Where are FOEG garments crafted?\nAll our creations are conceived in Paris and crafted in strictly limited series by specialized partner ateliers in France and Italy.',
        'What are the shipping delivery times?\nWe dispatch within France and Europe in 24 to 48 hours with signature required. For international shipments to the United States and the Americas, delivery takes 3 to 5 business days via DHL Express with priority customs clearance included.',
        'What is your return and exchange policy?\nYou have 30 calendar days from receipt to try on your pieces and request a complimentary return or size exchange.',
        'How can I book an appointment at the Paris atelier?\nOur private salon on Rue Lucien Sampaix in Paris welcomes you by appointment from Monday to Saturday. You can schedule a visit by emailing concierge@foeg-paris.com.',
        'Which payment methods are accepted?\nWe accept major international credit cards via Stripe, Apple Pay, PayPal, SEPA bank transfers, and regional payment methods for our Private Circle members.',
      ],
    },
  },
};

export function getInfoPageContent(slug: string, lang: InfoLanguage = 'fr'): InfoPageContent | null {
  const dictionary = INFO_PAGES_MULTILINGUAL[lang] || INFO_PAGES_MULTILINGUAL.fr;
  return dictionary[slug] || INFO_PAGES_MULTILINGUAL.fr[slug] || null;
}

// Fallback retrocompatible
export const INFO_PAGES: Record<string, InfoPageContent> = INFO_PAGES_MULTILINGUAL.fr;
