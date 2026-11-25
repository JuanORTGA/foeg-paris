# DOCUMENTATION TECHNIQUE & ARCHITECTURE — MAISON FOEG PARIS
> **Version du document :** 2.4.0  
> **Dernière mise à jour :** 24 Novembre 2026  
> **Projet :** FOEG Paris (`foeg-paris`) — E-Commerce Haute Couture & Atelier d’Administration

---

## 1. STACK TECNOLÓGICO UTILIZADO

El ecosistema de FOEG Paris combina tecnologías de última generación para ofrecer una experiencia de compra fluida con estética de *lujo silencioso* (*Silent Luxury* / The Row), alta velocidad de carga, renderizado híbrido y seguridad institucional.

| Tecnología | Versión | Rol en el Proyecto |
| :--- | :--- | :--- |
| **Next.js** | `15.1.7` (App Router) | Framework central React full-stack. Gestiona el enrutamiento híbrido (Server Components, Client Components, Server Actions), optimización de recursos y renderizado en servidor (SSR/SSG/ISR). |
| **React** | `19.0.0` | Biblioteca de interfaz de usuario de última generación con soporte para componentes asíncronos y hooks concurrentes. |
| **TypeScript** | `5.7.3` | Tipado estático estricto en el 100% del código fuente, garantizando solidez, autocompletado y prevención de errores en compilación. |
| **Tailwind CSS** | `3.4.17` | Framework de utilidades CSS personalizado con la paleta de color oficial de la Maison (`#F7F5F0` Off-White, `#1A1A1A` Soft Black, `#1B2A4A` Deep Navy), tipografías editoriales (`Cormorant Garamond`, `Inter`) y estilos de impresión (`@media print`). |
| **Prisma ORM** | `6.4.0` | Mapeador objeto-relacional (ORM) para la interacción con la base de datos SQL. Maneja migraciones, esquemas declarativos, consultas optimizadas y control de concurrencia. |
| **Neon PostgreSQL** | Cloud Serverless | Base de datos relacional PostgreSQL serverless alojada en AWS (Ohio `us-east-2`), configurada con *Connection Pooling* (`pgbouncer=true`) para alta concurrencia. |
| **NextAuth (Auth.js)** | `5.0.0-beta.25` | Sistema de autenticación seguro basado en JWT (JSON Web Tokens) sin estado para clientes y administradores con protección de contraseñas mediante `bcryptjs`. |
| **bcryptjs** | `2.4.3` | Encriptación unidireccional y comparación segura de contraseñas mediante funciones hash salteadas (costo 10). |
| **Recharts** | `^2.15.0` | Biblioteca de visualización de datos y gráficos analíticos interactivos para el Dashboard administrativo de ventas y finanzas. |
| **Cloudinary** | API REST / CDN | Gestión, optimización y entrega de activos visuales de alta costura (imágenes de catálogo, comprobantes y galerías) mediante almacenamiento en la nube. |
| **Stripe** | Live/Test API | Procesamiento bancario internacional compatible con tarjetas Visa, MasterCard, American Express, Apple Pay y SEPA Debit. |
| **PayPal** | SDK / REST API | Pasarela global para cobros internacionales en divisas EUR y USD. |
| **Cobrix API** | REST Gateway | Integración de pagos alternativos y locales (Bolívares / Venezuela, Pago Móvil, BCV). |
| **Lucide React** | `0.475.0` | Conjunto iconográfico minimalista y estilizado de trazo fino (`strokeWidth={1}` / `1.5`). |
| **PostCSS & Autoprefixer** | `8.5.2` / `10.4.20` | Procesamiento y compatibilidad multi-navegador de las directivas CSS. |

---

## 2. ARQUITECTURA DE LA BASE DE DATOS (prisma/schema.prisma)

La base de datos relacional está modelada en Neon PostgreSQL a través de Prisma. Cuenta con **14 modelos principales**, diseñados para cubrir compras, catálogo, inventario por variantes, reseñas, promociones, contenidos dinámicos y ajustes del atelier.

```mermaid
erDiagram
    User ||--o{ Order : "realiza"
    User ||--o{ Wishlist : "guarda"
    User ||--o{ Review : "escribe"
    User ||--o{ Address : "posee"
    Product ||--o{ Variant : "tiene"
    Product ||--o{ Measurement : "define"
    Product ||--o{ Wishlist : "incluido_en"
    Product ||--o{ Review : "recibe"
    Order ||--o{ OrderItem : "contiene"
    Order ||--o{ Transaction : "registra"
```

### Detalle de Modelos (Tablas)

#### 1. `Product` (Piezas de Colección)
*Guarda los datos maestros de cada prenda o accesorio del vestuario de la Maison.*
- **Campos principales:** `id`, `slug` (Unique), `name`, `price`, `currency`, `description`, `category` (`Mujer` | `Hombre`), `subcategory`, `images` (String[]), `isNew`, `composition`, `origin`, `care` (String[]).
- **Relaciones:** `variants`, `measurements`, `wishlists`, `reviews`.

#### 2. `Variant` (Tallas, Colores y Stock)
*Controla el inventario exacto por combinación de talla y color de cada producto.*
- **Campos principales:** `id`, `productId`, `size`, `color`, `stock` (Int).
- **Restricción:** Clave única compuesta `@@unique([productId, size, color])`.

#### 3. `Measurement` (Guía de Medidas Físicas)
*Permite mostrar la tabla de medidas corporales exacta de cada prenda.*
- **Campos principales:** `id`, `productId`, `size`, `chest`, `waist`, `hips`, `length`.
- **Restricción:** Clave única compuesta `@@unique([productId, size])`.

#### 4. `Order` (Pedidos y Ventas)
*Almacena todas las compras realizadas en la tienda con su estado, método de envío y facturación.*
- **Campos principales:** `id`, `orderNumber` (Unique), `userId` (opcional), `email`, `firstName`, `lastName`, `address`, `city`, `postalCode`, `shippingMethod` (`SHIPPING` | `PICKUP`), `paymentMethod` (`STRIPE`, `PAYPAL`, `VIREMENT`, `ZELLE`, `BINANCE`, `ZINLI`, `PAGO_MOVIL`), `total`, `currency`, `status`, `trackingNumber`.
- **Relaciones:** `User`, `OrderItem`, `Transaction`.

#### 5. `OrderItem` (Líneas de Detalle del Pedido)
*Registra cada prenda individual adquirida dentro de una orden.*
- **Campos principales:** `id`, `orderId`, `productId`, `productName`, `size`, `quantity`, `price`.

#### 6. `Transaction` (Transacciones de Pago)
*Bitácora financiera de pagos procesados mediante pasarelas externas y transferencias locales.*
- **Campos principales:** `id`, `orderId`, `amount`, `currency`, `status` (`PAID`, `PENDING`, `FAILED`), `paymentMethod`, `transactionRef`.

#### 7. `User` (Clientes y Administradores)
*Gestiona los perfiles de acceso con credenciales cifradas y roles diferenciados.*
- **Campos principales:** `id`, `email` (Unique), `name`, `password` (hash bcrypt), `role` (`CUSTOMER` | `ADMIN`).
- **Relaciones:** `orders`, `wishlists`, `reviews`, `addresses`.

#### 8. `Coupon` (Cupones de Descuento y Privilegios)
*Reglas comerciales de reducción porcentual o de importe fijo en el carrito y checkout.*
- **Campos principales:** `id`, `code` (Unique), `discountType` (`PERCENTAGE` | `FIXED`), `discountValue` (Float), `isActive` (Boolean), `expiresAt` (DateTime?).

#### 9. `Wishlist` (Lista de Deseos Privada)
*Permite a los clientes miembros guardar sus piezas favoritas.*
- **Campos principales:** `id`, `userId`, `productId`, `createdAt`.
- **Restricción:** Clave única compuesta `@@unique([userId, productId])`.

#### 10. `Review` (Reseñas y Calificaciones con Moderación)
*Opiniones de clientes sobre las prendas con evaluación de calce, emojis y foto opcional.*
- **Campos principales:** `id`, `productId`, `userId`, `rating` (1-5 estrellas), `fit` (`SMALL` | `TRUE_TO_SIZE` | `LARGE`), `comment`, `imageUrl`, `isApproved` (Boolean).

#### 11. `SiteContent` (Visual CMS Multi-idioma)
*Gestiona los textos de la portada, bloques editoriales y reels en tres idiomas sin tocar código.*
- **Campos principales:** `id`, `key` (Unique), `section`, `valueFr` (Francés), `valueEn` (Inglés), `valueEs` (Español).

#### 12. `Notification` (Alertas del Atelier)
*Notificaciones en tiempo real para el panel de administración sobre nuevos pedidos, comprobantes o stock crítico.*
- **Campos principales:** `id`, `title`, `message`, `type`, `isRead` (Boolean), `link`.

#### 13. `Setting` (Configuración Dinámica de la Maison)
*Almacén clave-valor para llaves de pasarelas, conmutadores de pago, boutiques físicas y parámetros de envío.*
- **Campos principales:** `id`, `key` (Unique), `value` (Text / JSON serializado).

#### 14. `Address` (Libreta de Direcciones del Cliente)
*Direcciones de entrega predeterminadas de los clientes para un checkout ágil.*
- **Campos principales:** `id`, `userId`, `firstName`, `lastName`, `address`, `city`, `postalCode`, `country`, `phone`, `isDefault` (Boolean).

---

## 3. ESTRUCTURA DE CARPETAS Y CÓDIGO

```
foeg/
├── app/                       # Enrutador Next.js App Router
│   ├── (content)/             # Rutas editoriales e informativas públicas
│   │   ├── [infoSlug]/        # Páginas legales dinámicas (términos, envíos, cuidado)
│   │   ├── boutique/          # Presentación de boutiques físicas (París & Caracas)
│   │   ├── faq/               # Preguntas frecuentes interactivas trilingües
│   │   └── journal/           # Publicaciones editoriales (artículos y ensayos trilingües)
│   │       ├── [slug]/        # Lectura inmersiva individual de crónicas
│   │       └── JournalClient.tsx # Cliente dinámico FR / ES / EN
│   ├── (shop)/                # Rutas comerciales y área privada del cliente
│   │   ├── cercle-prive/      # Club privado de fidelidad y ventajas exclusivas
│   │   ├── colecciones/       # Vestiaire completo y lookbook
│   │   ├── cuenta/            # Acceso cliente, perfil, direcciones, pedidos y deseos
│   │   ├── femme/ & mujer/    # Catálogo femenino
│   │   ├── hombre/            # Catálogo masculino
│   │   └── producto/[slug]/   # Página de detalle de producto (PDP)
│   ├── admin/                 # Panel de Control exclusivo de la Dirección
│   │   ├── ajustes/           # Parámetros generales y concierge
│   │   ├── boutiques/         # Gestión de tiendas físicas y Click & Collect
│   │   ├── clientes/          # Directorio de clientes
│   │   ├── cms/               # Studio Créatif (CMS Visual con edición en directo)
│   │   ├── contenido/         # Visual CMS trilingüe
│   │   ├── cupones/           # CRUD de cupones de descuento y promociones
│   │   ├── envios/            # Configuración de transportistas y tarifas
│   │   ├── journal/           # CRUD de artículos de blog
│   │   ├── login/             # Portal de acceso seguro al atelier
│   │   ├── media/             # Mediateca y subida Cloudinary
│   │   ├── newsletter/        # Suscriptores de correspondencia privada
│   │   ├── pagos/             # Activación y parámetros de pasarelas con logotipos
│   │   ├── pedidos/           # Órdenes, estados y facturación
│   │   ├── perfil/            # Seguridad y contraseña del administrador
│   │   ├── productos/         # Catálogo maestro, tallas, fotos y stock
│   │   ├── resenas/           # Moderación de comentarios y fotos
│   │   └── seo/               # Títulos, descripciones y Open Graph
│   ├── api/                   # Rutas de endpoints HTTP
│   │   ├── auth/[...nextauth]/# Endpoints de sesión y autenticación NextAuth
│   │   ├── upload/            # Carga directa de imágenes hacia Cloudinary o local
│   │   └── webhooks/payment/  # Confirmaciones asíncronas de cobros
│   ├── checkout/              # Proceso de compra con pasarela híbrida y cupones
│   │   └── merci/             # Pantalla de confirmación con tasa BCV y pagos locales
│   ├── factura/[orderNumber]/ # Factura oficial legal imprimible
│   ├── maintenance/           # Página de mantenimiento exclusiva de lujo
│   ├── search/                # Buscador multilingüe en tiempo real de catálogo
│   ├── error.tsx              # Boundary de captura de errores de cliente
│   ├── global-error.tsx       # Boundary global a nivel de RootLayout
│   ├── globals.css            # Estilos globales, variables y reglas de impresión
│   ├── layout.tsx             # Root Layout con proveedores de estado
│   ├── not-found.tsx          # Página 404 personalizada con estética editorial
│   └── page.tsx / HomeClient.tsx # Portada principal Haute Couture (Home)
├── components/                # Componentes modulares reutilizables
│   ├── admin/                 # Componentes del panel (Sidebar, Header, AnalyticsCharts)
│   ├── cms/                   # Componentes editables en vivo (EditableText, EditableImage)
│   ├── layout/                # Estructura de tienda (Header, Footer, MiniCart, SearchOverlay)
│   ├── product/               # Fichas de producto, galería zoom, QuickView y Reseñas
│   ├── providers/             # Proveedores globales (Auth, Currency, Language, Cart, Wishlist)
│   └── ui/                    # Primitivas visuales (PageLoader, MediaBox, Accordion)
├── lib/                       # Utilidades, lógica de negocio y Server Actions
│   ├── cart-context.tsx       # Estado global del carrito de compras (LocalStorage)
│   ├── currency-context.tsx   # Conversión de divisas EUR/USD en tiempo real
│   ├── language-context.tsx   # Motor de traducción multilingüe (FR, EN, ES)
│   ├── wishlist-context.tsx   # Lista de deseos en memoria y base de datos
│   ├── db.ts & prisma.ts      # Cliente Singleton de Prisma con pool de Neon
│   ├── i18n.ts                # Diccionario simétrico de traducciones (948 claves exactas)
│   ├── journal-data.ts        # Ensayos y crónicas multilingües sincronizadas
│   ├── payments.ts            # Adaptador unificado de pagos (Stripe, PayPal, Pago Móvil, etc.)
│   ├── translate.ts           # Motor de autotraducción inteligente (Google Translate API)
│   └── notifications.ts       # Sistema de alertas administrativas
├── prisma/                    # Esquema y semillas de base de datos
│   ├── schema.prisma          # Definición declarativa de modelos PostgreSQL
│   └── seed.ts                # Población inicial de piezas y credenciales
└── public/                    # Activos estáticos públicos (logo-foeg.png, uploads de reels)
```

---

## 4. FUNCIONALIDADES CLAVE Y ÚLTIMAS IMPLEMENTACIONES

### A. Sistema Multilingüe Integral (Auditoría Definitiva)
1. **Diccionario Simétrico Trilingüe (`lib/i18n.ts`):**
   - **948 claves exactas** presentes en Francés (`FR`), Inglés (`EN`) y Español (`ES`) con 0 faltantes.
   - Francés como idioma base institucional de la Maison.
   - Mecanismo de contingencia (*fallback* automático): si una traducción no existe en ES o EN, muestra automáticamente la versión francesa en lugar de un texto vacío o error.
2. **Cobertura 100% en Toda la Tienda:**
   - **Header y Navegación:** Categorías (*Mujer, Hombre, Colecciones, Tiendas, Journal*), selector de idioma y divisa.
   - **Ficha de Producto (PDP):** Tiempos de entrega con firma, políticas de devolución y acordeones técnicos.
   - **Checkout & Confirmación (`/checkout/merci`):** Pasarelas, botones de acción (*Pagar con Tarjeta*, *Confirmar Pago Móvil*), tasa BCV para pagos en Bs., comprobantes y credenciales seguras.
   - **Área de Cliente:** Saludos dinámicos (*Bonjour / Hola / Hello*), banner VIP de Cercle Privé, libreta de direcciones y seguimiento de pedidos (*Virement à Valider*, *Préparation Atelier*, *Expédition Signature*).
   - **Journal Editorial (`/journal` y `/journal/[slug]`):** 4 crónicas completas con ensayos, citas en Serif y fechas traducidas dinámicamente.
   - **Buscador (`/search`):** Mensajes de conteo (*prendas encontradas*) y pantallas de búsqueda sin resultados.
3. **Autotraducción en el CMS:**
   - Al editar o guardar textos en el CMS (`updateContentField`), el sistema ejecuta `smartTranslateAll` en paralelo, traduciendo automáticamente al francés, español e inglés para que las 3 columnas en Neon queden siempre pobladas.

### B. Portada y Sección de Reels Multimedia ("L'Atelier en Mouvement")
1. **Relación de Aspecto de Moda Editorial:**
   - Proporción compacta `aspect-[9/13]` en móviles y `aspect-[2/3]` en escritorio, eliminando la sensación de video vertical alargado de redes sociales y logrando una estética de catálogo de alta costura.
2. **Nivelación Milimétrica ("Rack con Rack"):**
   - Todos los títulos están limitados estrictamente a **1 sola línea** con truncado elíptico elegante (`line-clamp-1 truncate`).
   - Contenedores de texto con altura fija idéntica (`h-[48px]`), garantizando que la línea visual inferior quede completamente nivelada al ras entre todas las tarjetas.
   - Más del 92% de la superficie queda limpia y transparente para el video, con degradados de sombra mínimos (`h-14`) únicamente en la base.
3. **Videos Locales de Respaldo:**
   - Conexión directa a videos locales en alta definición (`/uploads/foeg-reel-*.mp4`) para garantizar reproducción continua fluida y evitar tarjetas negras por fallas de URLs externas.

### C. Galería Instagram de la Maison
1. **Redirección Fija a Instagram Oficial:**
   - Las 5 fotos cuadradas de la cuadrícula de la Maison en la Home dirigen de forma fija e inalterable a **`https://www.instagram.com/foegparis/`** (`target="_blank"`).
   - Aunque se sustituyan las imágenes desde el CMS Studio, el enlace hacia la cuenta oficial permanece intacto.
   - Efecto hover con botón flotante del isotipo de Instagram.

### D. Studio Créatif (CMS Visual en Directo)
1. **Barra Superior Editorial de Lujo Silencioso:**
   - Fondo Azul Marino profundo (`#1B2A4A`) con borde sutil blanco/10.
   - Título en tipografía Serif: *Studio Créatif · Maison FOEG · Édition en Direct*.
   - Selector de idiomas minimalista con subrayado fino.
   - Botón de publicación en vivo de color Blanco Roto (`#F7F5F0`) con texto Azul Marino (`#1B2A4A`) y trazo de *Check* fino, eliminando botones chillones.
   - Eliminación de indicadores innecesarios de sincronización para mantener la sobriedad visual.

### E. Dashboard de Administración & Analíticas
1. **Gráficas Financieras con Recharts (`app/admin/page.tsx`):**
   - **Gráfico de Líneas/Barras:** Ventas de los últimos 7 días agrupadas por fecha en Neon PostgreSQL.
   - **Gráfico Circular (PieChart):** Proporción de métodos de pago utilizados (Stripe, PayPal, Zelle, Pago Móvil, etc.) respetando la paleta de colores de FOEG.
2. **Gestión de Cupones (`app/admin/cupones`):**
   - Panel CRUD completo para crear, activar, desactivar y programar fechas de expiración de cupones de descuento (porcentuales o fijos).
   - Validación instantánea vía Server Action en el Checkout.
3. **Logotipos Oficiales de Pasarelas:**
   - Reemplazo de textos planos por iconos refinados y reconocibles para Visa, Mastercard, PayPal, Zelle, Binance, Zinli y Pago Móvil.
4. **Reseñas con Emojis y Fotos:**
   - Selector de expresiones visuales en el formulario de reseñas y subida opcional de fotos reales de las prendas puestas.

### F. Modo Mantenimiento de Lujo
1. **Página de Atelier en Pausa (`app/maintenance/page.tsx`):**
   - Estética minimalista con tipografía Serif y captura de correo electrónico para notificar la reapertura.
2. **Control por Middleware (`middleware.ts`):**
   - Activación inmediata mediante la variable de entorno `MAINTENANCE_MODE="true"`.
   - Redirige todo el tráfico público a `/maintenance`, dejando libre acceso a rutas de administración (`/admin`) y APIs (`/api`).

---

## 5. VARIABLES DE ENTORNO (.env)

El archivo `.env` en la raíz contiene las credenciales operativas del sistema:

```env
# =========================================================================
# 1. BASE DE DATOS (Neon PostgreSQL Serverless)
# =========================================================================
DATABASE_URL="postgresql://usuario:password@ep-morning-butterfly-bd9x2msj-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=15"
DIRECT_URL="postgresql://usuario:password@ep-morning-butterfly-bd9x2msj.us-east-2.aws.neon.tech/neondb?sslmode=require&connect_timeout=15"

# =========================================================================
# 2. AUTENTICACIÓN (NextAuth.js v5)
# =========================================================================
AUTH_SECRET="tu_secreto_criptografico_base64"
NEXTAUTH_SECRET="tu_secreto_criptografico_base64"
NEXTAUTH_URL="http://localhost:3000"
AUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST=true

# =========================================================================
# 3. PASARELAS DE PAGO Y URL PÚBLICA
# =========================================================================
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_o_test_..."
STRIPE_SECRET_KEY="sk_live_o_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
PAYPAL_CLIENT_ID="tu_paypal_client_id"
PAYPAL_SECRET="tu_paypal_secret"
COBRIX_API_KEY="tu_cobrix_api_key"
COBRIX_API_URL="https://api.cobrix.io/v1"

# =========================================================================
# 4. ALMACENAMIENTO DE IMÁGENES (Cloudinary)
# =========================================================================
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="tu_cloud_name"
CLOUDINARY_API_KEY="tu_api_key"
CLOUDINARY_API_SECRET="tu_api_secret"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="foeg_paris_preset"

# =========================================================================
# 5. CONTROL OPERATIVO & TRADUCCIÓN
# =========================================================================
# Activar para poner la tienda pública en modo mantenimiento ("true" o "false")
MAINTENANCE_MODE="false"

# Clave opcional para Google Cloud Translation API (si no se proporciona, opera con el motor de resiliencia y diccionario interno)
GOOGLE_TRANSLATE_API_KEY=""
```

---

## 7. ARQUITECTURA DE TRADUCCIÓN AUTÓNOMA E I18N INTEGRAL (FR / EN / ES)

Maison FOEG Paris implementa una arquitectura i18n de nivel empresarial diseñada para Next.js 15 App Router, React 19 y TypeScript estricto:

### 1. Dual Persistence SSR/RSC (Cookie + LocalStorage)
- **Persistencia en Servidor (`cookies`):** Se almacena la cookie `foeg_lang` con duración de 1 año (`SameSite=Lax`). En `app/layout.tsx`, el Server Component lee `await cookies()` para inyectar inmediatamente el atributo `<html lang={initialLanguage}>` y renderizar el árbol de componentes sin saltos visuales ni *hydration mismatch*.
- **Sincronización en Cliente (`LanguageProvider`):** `lib/language-context.tsx` mantiene sincronizado `localStorage` con la cookie en cada cambio de idioma y ajusta `document.documentElement.lang`.

### 2. Motor de Traducción Resiliente (`lib/translate.ts`)
- **Diccionario Editorial de Respaldo (`EDITORIAL_FALLBACKS`):** Términos frecuentes de alta costura (`Atelier`, `Maison`, `Savoir-Faire`, `Soie`, `Cachemire`, `Luxe Silencieux`, etc.) disponibles instantáneamente sin llamadas de red.
- **Resiliencia de Red:** Límite de tiempo estricto de 3.5 segundos con `AbortController`. En caso de fallo o timeout, garantiza la devolución segura del texto fuente para evitar campos vacíos o roturas en Studio Créatif / CMS.

### 3. Separación Estricta: Enums Técnicos vs. UI Visible
- Los valores internos de base de datos y pasarelas (`STRIPE`, `VIREMENT`, `PAGO_MOVIL`, `PICKUP`, `SHIPPING`, `TRUE_TO_SIZE`, `PENDING_VERIFICATION`) se preservan inmutables en Prisma y Server Actions.
- La traducción ocurre exclusivamente en la capa de presentación mediante la función `t()` y adaptadores tipados.

### 4. Cobertura End-to-End
- **Rutas del Sistema:** `not-found.tsx`, `error.tsx`, `global-error.tsx` y `maintenance/MaintenanceClient.tsx` localizados en los tres idiomas.
- **Tienda y Ficha de Producto:** Guía de calce, reseñas dinámicas con avatar anónimo institucional, botones de lista de deseos y carruseles sincronizados.
- **Journal Editorial:** Soporte para artículos bilingües/trilingües con traducción automática autónoma en `lib/journal-actions.ts` y fusión con `JOURNAL_ARTICLES`.
- **Factura Oficial (`/factura/[orderNumber]`):** Traducción completa al imprimir en PDF o visualizar en pantalla (métodos de pago, coordenadas fiscales, certificación de autenticidad).
- **Correos Transaccionales (`lib/mail.ts`):** Plantillas de confirmación de pedido (`getOrderConfirmationEmailHtml`), despacho (`getOrderShippedEmailHtml`) y bienvenida (`getWelcomeEmailHtml`) enviadas en el idioma exacto utilizado por el cliente.
- **Módulos Administrativos:** Panel de control (`AdminDashboardClient`), cupones (`AdminCuponesClient`), reseñas (`AdminResenasClient`) y catálogo (`AdminProductosClient`).

---

## 8. POLÍTICA DE EXCLUSIVIDAD: ACCESO PRIVADO, CIERRE DE SESIÓN Y CHECKOUT OBLIGATORIO

Para mantener la identidad institucional de *lujo silencioso* y trazabilidad de piezas de alta costura, se ha implementado el modelo de **Acceso Privado Obligatorio**:

### 1. Limpieza de Sesión al Desconectar (`SignOut`)
- **Vaciado de Carrito y Lista de Deseos:** Al presionar *"Cerrar sesión"* en [components/layout/UserMenu.tsx](file:///C:/Users/EDGAR%20R%20BLANCO%20A/.gemini/antigravity/scratch/foeg/components/layout/UserMenu.tsx), se invocan `clearCart()` y `clearWishlist()`, removiendo los registros de `localStorage` (`foeg_cart_items`, `foeg_wishlist`, `foeg_applied_coupon`) y emitiendo el evento global `foeg-session-logout`.
- **Contadores en Cero:** Tanto el icono de corazón (deseos) como el de la bolsa (carrito) en la cabecera eliminan sus badges numéricos (`1`) inmediatamente, garantizando que un usuario no autenticado no conserve datos de una sesión anterior.

### 2. Bloqueo de Compra y Redirección al Checkout (`/checkout`)
- **Protección de Pasarela:** Nadie puede acceder al proceso de pago en [app/checkout/page.tsx](file:///C:/Users/EDGAR%20R%20BLANCO%20A/.gemini/antigravity/scratch/foeg/app/checkout/page.tsx) como invitado no identificado.
- **Redirección con Retorno (`callbackUrl`):** Si un visitante sin sesión intenta hacer clic en *"Passer à la caisse"* en el MiniCart o ingresa a `/checkout`, es redirigido a `/cuenta?callbackUrl=/checkout`.
- **Mensaje Institucional:** En la pantalla de autenticación [app/(shop)/cuenta/CuentaAuthClient.tsx](file:///C:/Users/EDGAR%20R%20BLANCO%20A/.gemini/antigravity/scratch/foeg/app/(shop)/cuenta/CuentaAuthClient.tsx), se le notifica que para adquirir una creación y certificar su pieza de taller debe iniciar sesión o crear su cuenta privada.
- **Retorno Automático con Carrito Intacto:** Una vez autenticado, el cliente es devuelto automáticamente a `/checkout` con sus prendas listas para pagar y con sus datos (nombre, apellido y correo) autocompletados desde su perfil de NextAuth.

### 3. Reseñas Protegidas (`Reviews.tsx`)
- **Filtro de Autenticidad:** La publicación de valoraciones en la ficha de producto requiere pertenecer al *Cercle Privé*. Si un usuario no registrado pulsa *"Dejar una reseña"*, se le presenta un aviso discreto con un enlace para registrarse o iniciar sesión, impidiendo comentarios anónimos falsos.

---

## 9. PERSISTENCIA DE COOKIES Y BLINDAJE DE BADGES PARA VISITANTES NO AUTENTICADOS

### 1. Blindaje de Badges e Iconos de Cabecera (`Header.tsx`)
- **Condición Estricta `isAuthenticated`:** Los contadores numéricos (badges) del corazón (Lista de Deseos) y la bolsa de compras (Carrito) requieren obligatoriamente `isAuthenticated` además de `isMounted`.
- **Cero Elementos Residuales:** En visitantes no autenticados o tras el cierre de sesión, `wishlistCount` y `totalItems` en la cabecera permanecen sin badges numéricos, evitando confusiones o remanentes de compras previas.
- **Limpieza en Contextos (`CartProvider` y `WishlistProvider`):** Al detectar `status === 'unauthenticated'`, los estados internos se restablecen inmediatamente a `[]` y se remueven de `localStorage` las claves `foeg_cart_items` y `foeg_wishlist`.

### 2. Persistencia Robusta del Banner de Cookies (`CookieBanner.tsx`)
- **Doble Almacenamiento (Cookie HTTP + LocalStorage):** El consentimiento (`foeg_cookie_consent`) y las preferencias (`foeg_cookie_preferences`) se guardan tanto en `localStorage` como en una cookie de navegador con duración de 1 año (`max-age=31536000; path=/; SameSite=Lax`).
- **Verificación en Carga:** Al cargar la página, se comprueba la existencia de consentimiento en cualquiera de los dos medios. Si ya fue aceptado o cerrado previamente, el banner nunca vuelve a desplegarse en recargas de página.
- **Cierre Rápido y Accesibilidad:** Se añade soporte para cierre y guardado con la tecla `Escape`, con el botón `X`, o al hacer clic en *"Aceptar todas"*. El banner únicamente se reabre cuando el usuario lo solicita explícitamente desde el enlace *"Cookies"* en el pie de página.

---

## 10. ARQUITECTURA DE VELOCIDAD Y NAVEGACIÓN ULTRA-RÁPIDA (TIENDA PÚBLICA)

Para garantizar una experiencia de navegación instantánea acorde a los estándares de *Silent Luxury* y eliminar la latencia perceptible entre rutas:

### 1. Desbloqueo de Prefetching e ISR (`revalidate = 60`)
- **Eliminación de `force-dynamic` en Rutas Públicas:** Se eliminó `force-dynamic` en la portada (`app/page.tsx`), fichas de producto (`app/(shop)/producto/[slug]/page.tsx`) y crónicas (`app/(content)/journal/page.tsx`, `app/(content)/journal/[slug]/page.tsx`).
- **Respuestas Instantáneas en 0 ms:** Al implementar `export const revalidate = 60;`, Next.js 15 activa el prefetching estático de `<Link prefetch={true}>` en segundo plano, sirviendo las páginas desde memoria sin esperar viajes a Neon PostgreSQL.
- **Invalidación Precisa:** Toda actualización en el panel administrativo (`app/admin/productos/actions.ts`, `app/admin/cms/actions.ts`, `app/admin/contenido/actions.ts` y `lib/settings-actions.ts`) ejecuta `revalidatePath()` y `revalidateTag()`, actualizando el catálogo y contenido de inmediato sin sacrificar la velocidad del cliente.

### 2. Paralelización de Consultas (`Promise.all()`)
- **Ficha de Producto (`/producto/[slug]`):** Se combinó la consulta del producto principal (`prisma.product.findFirst`) y la de productos relacionados (`prisma.product.findMany`) en un único `Promise.all()`, eliminando los viajes secuenciales en cascada (*waterfalls*).

### 3. Aligeramiento de Payload en Catálogos
- **Eliminación de Medidas Innecesarias:** En `/colecciones`, `/hombre` y `/mujer`, se suprimió `include: { measurements: true }`. Las medidas solo se consultan en la ficha de producto individual para la guía de tallas, reduciendo significativamente la memoria y el tamaño de respuesta de la base de datos.

### 4. Deduplicación de Consultas con `React.cache()`
- **Ajustes SEO (`lib/settings-actions.ts`):** La función `getSeoSettings` se encapsuló con `cache(unstable_cache(...))`, evitando que `generateMetadata()` y el render de la página ejecuten consultas duplicadas a Neon durante la misma petición.

### 5. Suspense y Skeletons Editoriales de Respuesta Inmediata
- **Grupo de Contenido (`app/(content)/loading.tsx`):** Se implementó un skeleton minimalista sobrio en `#F7F5F0` / `#EBE7DF` para dar retroalimentación visual táctil instantánea al pulsar en Boutiques, Journal, FAQ o páginas legales.
- **Detalle de Journal (`app/(content)/journal/[slug]/loading.tsx`):** Skeleton específico para crónicas individuales, eliminando la sensación de congelamiento visual.

---

## 11. ARQUITECTURA MÓVIL, RESPONSIVE Y ERGONOMÍA TÁCTIL DE LUJO SILENCIOSO

Para brindar una experiencia móvil nativa y fluida en teléfonos (320px–430px) y tablets (768px–1024px) alineada a los cánones de *Silent Luxury* (The Row, Bottega Veneta):

### 1. Tienda Pública y Ficha de Producto (PDP)
- **Viewport y Safe Areas (`100dvh`):** En `MiniCart.tsx` y `Header.tsx`, la altura de cajones laterales y menús móviles utiliza `h-[100dvh] max-h-[100dvh]` y relleno inferior `pb-[calc(1.25rem+env(safe-area-inset-bottom))]`, evitando que las barras nativas de iOS Safari y Android tapen los botones de acción.
- **Áreas Táctiles Mínimas (44x44px):** Todos los botones clave (favoritos en `ProductCard.tsx`, selector de moneda, conmutador de idioma y botones de cierre `X`) cuentan con un área de contacto táctil de al menos 44px de alto y ancho.
- **Prevención de Zoom Brusco en iOS:** Se configuró protección global de tamaño de fuente (`16px !important` en campos de texto en `< 768px`) para evitar el molesto auto-zoom de Safari móvil al enfocar inputs.

### 2. Flujo de Compra y Poscompra (Checkout, Merci y Factura)
- **Resumen Colapsable Superior en Checkout (`app/checkout/page.tsx`):** Se añadió un acordeón minimalista superior (`lg:hidden`) con el total siempre visible al inicio del formulario. Al desplegarse, muestra miniaturas de las piezas, tallas, cupones activos, desglose de envío y conversión en Bolívares (tasa BCV) sin obligar al usuario a descender al pie de la página.
- **Copia Rápida con 1 Toque (`app/checkout/merci/MerciClient.tsx`):** Botones interactivos de copiado con confirmación visual trilingüe (*"Copié ✓"* / *"Copiado ✓"* / *"Copied ✓"*) para el número de pedido, cuentas bancarias francesas (IBAN / BIC), Zelle, Binance Pay, Zinli y Pago Móvil (teléfono, cédula y monto exacto).
- **Modal de Comprobante Blindado para Teclados Móviles:** El modal de envío de comprobante cuenta con `max-h-[90dvh] overflow-y-auto` y botón de cierre táctil cómodo para no quedar tapado cuando el teclado del teléfono se activa.
- **Factura Adaptativa (`app/factura/[orderNumber]/FacturaClient.tsx`):** En teléfonos (`< sm`), las piezas confeccionadas se visualizan en tarjetas de recibo de alta costura, mientras que en pantallas de escritorio y al exportar/imprimir a PDF (`@media print`) se preserva íntegramente la tabla formal de 5 columnas.

### 3. Área de Cliente y Panel Administrativo
- **Pestañas con Scroll Táctil (`CustomerDashboardClient.tsx`):** La barra de pestañas del Área de Cliente cuenta con `overflow-x-auto no-scrollbar whitespace-nowrap`, permitiendo navegar cómodamente con gestos táctiles horizontales entre Perfil, Direcciones, Pedidos y Lista de Deseos sin cortes ni saltos de línea.
- **Padding Óptimo en Admin (`app/admin/layout.tsx`):** El contenedor principal del panel de administración redujo su relleno móvil de `p-6` a `p-4 sm:p-8 lg:p-14`, otorgando mayor amplitud horizontal a las métricas y formularios en smartphones.
- **Tablas Administrativas con Desplazamiento Protegido:** Se aplicó `min-w-[550px]` a `min-w-[680px]` con `overflow-x-auto` en las tablas de Pedidos, Productos, Clientes, Cupones y Dashboard, evitando la compresión excesiva de columnas en pantallas estrechas.

---

*Documento técnico actualizado al 24 de Noviembre de 2026. Refleja fielmente la arquitectura, modelos de base de datos, módulos administrativos, pasarelas de pago, sistema i18n, política de exclusividad, optimizaciones de velocidad y ergonomía móvil de la Maison FOEG Paris.*
