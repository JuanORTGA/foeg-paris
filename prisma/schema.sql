-- =============================================================================
-- FOEG PARIS - Esquema Completo de Base de Datos PostgreSQL (Neon)
-- Compatible para copiar y pegar directamente en el SQL Editor de Neon
-- =============================================================================

-- 1. Tabla de Productos de Alta Costura
CREATE TABLE IF NOT EXISTS "Product" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT '€',
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,               -- 'Mujer' | 'Hombre'
    "subcategory" TEXT,                    -- 'Manteaux' | 'Chemises' | 'Pantalons' | 'Robes' | 'Chaussures' | 'Accessoires'
    "images" TEXT[] NOT NULL DEFAULT '{}', -- URLs de imágenes en alta resolución
    "isNew" BOOLEAN NOT NULL DEFAULT true,
    "composition" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "care" TEXT[] NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- Índice único por slug para búsquedas rápidas en la URL (/producto/[slug])
CREATE UNIQUE INDEX IF NOT EXISTS "Product_slug_key" ON "Product"("slug");

-- 2. Tabla de Variantes (Tallas, Stock y Color por Producto)
CREATE TABLE IF NOT EXISTS "Variant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "size" TEXT NOT NULL,                   -- 'S' | 'M' | 'L' | 'XL'
    "stock" INTEGER NOT NULL DEFAULT 0,
    "color" TEXT NOT NULL,

    CONSTRAINT "Variant_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Variant_productId_fkey" FOREIGN KEY ("productId") 
        REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Índice único para evitar duplicados de la misma talla y color en una prenda
CREATE UNIQUE INDEX IF NOT EXISTS "Variant_productId_size_color_key" ON "Variant"("productId", "size", "color");

-- 3. Tabla de Guía de Medidas (Atelier Fit Guide)
CREATE TABLE IF NOT EXISTS "Measurement" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "chest" TEXT NOT NULL,
    "waist" TEXT NOT NULL,
    "hips" TEXT NOT NULL,
    "length" TEXT NOT NULL,

    CONSTRAINT "Measurement_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Measurement_productId_fkey" FOREIGN KEY ("productId") 
        REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Measurement_productId_size_key" ON "Measurement"("productId", "size");

-- 4. Tabla de Pedidos (Commandes de la Maison)
CREATE TABLE IF NOT EXISTS "Order" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,            -- Ej: CMD-2026-0891
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "status" TEXT NOT NULL DEFAULT 'En attente', -- 'En préparation à l’Atelier' | 'Expédié' | 'Livré'
    "trackingNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Order_orderNumber_key" ON "Order"("orderNumber");

-- 5. Tabla de Ítems del Pedido
CREATE TABLE IF NOT EXISTS "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "productName" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") 
        REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 6. Tipo Enum de Roles de Usuario
DO $$ BEGIN
    CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 7. Tabla de Usuarios y Clientes Privados (Autenticación)
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- 8. Tabla de Contenido del Sitio (CMS Minimalista para Home y Textos)
CREATE TABLE IF NOT EXISTS "SiteContent" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "valueFr" TEXT NOT NULL,
    "valueEn" TEXT NOT NULL,
    "valueEs" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteContent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SiteContent_key_key" ON "SiteContent"("key");

-- 9. Tabla de Notificaciones en Tiempo Real para el Administrador
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'info',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- 10. Soporte de Transacciones y Vinculación de Pedidos a Clientes
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "userId" TEXT;
DO $$ BEGIN
    ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "Transaction" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "status" TEXT NOT NULL DEFAULT 'PAID',
    "paymentMethod" TEXT NOT NULL DEFAULT 'CARD',
    "transactionRef" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Transaction_orderId_fkey" FOREIGN KEY ("orderId") 
        REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Transaction_transactionRef_key" ON "Transaction"("transactionRef");

