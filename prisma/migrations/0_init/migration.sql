-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."FieldKey" AS ENUM ('text1', 'text2', 'text3', 'multiline1', 'multiline2', 'multiline3', 'num1', 'num2', 'num3', 'bool1', 'bool2', 'bool3', 'link1', 'link2', 'link3');

-- CreateEnum
CREATE TYPE "public"."FieldType" AS ENUM ('TEXT', 'NUMBER', 'BOOLEAN', 'LINK', 'MULTILINE');

-- CreateTable
CREATE TABLE "public"."Inventory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FieldMeta" (
    "id" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "fieldKey" "public"."FieldKey" NOT NULL,
    "fieldType" "public"."FieldType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "showInTable" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FieldMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IdTemplate" (
    "id" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "elements" JSONB NOT NULL DEFAULT '[]',
    "sequenceVal" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "IdTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Item" (
    "id" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "customId" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "text1" TEXT,
    "text2" TEXT,
    "text3" TEXT,
    "multiline1" TEXT,
    "multiline2" TEXT,
    "multiline3" TEXT,
    "num1" DECIMAL(18,4),
    "num2" DECIMAL(18,4),
    "num3" DECIMAL(18,4),
    "bool1" BOOLEAN,
    "bool2" BOOLEAN,
    "bool3" BOOLEAN,
    "link1" TEXT,
    "link2" TEXT,
    "link3" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Post" (
    "id" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userAvatar" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Inventory_userId_idx" ON "public"."Inventory"("userId");

-- CreateIndex
CREATE INDEX "Inventory_userId_name_idx" ON "public"."Inventory"("userId", "name");

-- CreateIndex
CREATE INDEX "FieldMeta_inventoryId_idx" ON "public"."FieldMeta"("inventoryId");

-- CreateIndex
CREATE UNIQUE INDEX "FieldMeta_inventoryId_fieldKey_key" ON "public"."FieldMeta"("inventoryId", "fieldKey");

-- CreateIndex
CREATE UNIQUE INDEX "IdTemplate_inventoryId_key" ON "public"."IdTemplate"("inventoryId");

-- CreateIndex
CREATE INDEX "Item_inventoryId_idx" ON "public"."Item"("inventoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Item_inventoryId_customId_key" ON "public"."Item"("inventoryId", "customId");

-- CreateIndex
CREATE INDEX "Post_inventoryId_createdAt_idx" ON "public"."Post"("inventoryId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."FieldMeta" ADD CONSTRAINT "FieldMeta_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "public"."Inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IdTemplate" ADD CONSTRAINT "IdTemplate_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "public"."Inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Item" ADD CONSTRAINT "Item_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "public"."Inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "public"."Inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

