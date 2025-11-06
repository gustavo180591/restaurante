/*
  Warnings:

  - The values [admin,operador,mozo,cliente] on the enum `Rol` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `Usuarios_Id_usuario` on the `Clientes` table. All the data in the column will be lost.
  - You are about to drop the column `Usuarios_Id_usuario` on the `Empleados` table. All the data in the column will be lost.
  - The primary key for the `Fotos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Id_Foto` on the `Fotos` table. All the data in the column will be lost.
  - You are about to drop the column `Ruta` on the `Fotos` table. All the data in the column will be lost.
  - You are about to drop the column `Tipo` on the `Fotos` table. All the data in the column will be lost.
  - You are about to drop the column `Fotos_Id_Foto` on the `Platos` table. All the data in the column will be lost.
  - The primary key for the `Usuarios` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Fotos_Id_Foto` on the `Usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `Id_usuario` on the `Usuarios` table. All the data in the column will be lost.
  - You are about to drop the `password_reset_tokens` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[Personas_Id_Persona,usuarioId]` on the table `Clientes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[Personas_Id_Persona,usuarioId]` on the table `Empleados` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `usuarioId` to the `Clientes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuarioId` to the `Empleados` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `Fotos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo` to the `Fotos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `Fotos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Rol_new" AS ENUM ('ADMIN', 'EMPLEADO', 'CLIENTE');
ALTER TABLE "public"."Personas" ALTER COLUMN "rol" DROP DEFAULT;
ALTER TABLE "public"."Usuarios" ALTER COLUMN "rol" DROP DEFAULT;
ALTER TABLE "Personas" ALTER COLUMN "rol" TYPE "Rol_new" USING ("rol"::text::"Rol_new");
ALTER TABLE "Usuarios" ALTER COLUMN "rol" TYPE "Rol_new" USING ("rol"::text::"Rol_new");
ALTER TYPE "Rol" RENAME TO "Rol_old";
ALTER TYPE "Rol_new" RENAME TO "Rol";
DROP TYPE "public"."Rol_old";
ALTER TABLE "Personas" ALTER COLUMN "rol" SET DEFAULT 'CLIENTE';
ALTER TABLE "Usuarios" ALTER COLUMN "rol" SET DEFAULT 'CLIENTE';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."CartaDetalle" DROP CONSTRAINT "CartaDetalle_Cartas_idCartas_fkey";

-- DropForeignKey
ALTER TABLE "public"."Cartas" DROP CONSTRAINT "Cartas_Usuarios_Id_usuario_fkey";

-- DropForeignKey
ALTER TABLE "public"."Clientes" DROP CONSTRAINT "Clientes_Usuarios_Id_usuario_fkey";

-- DropForeignKey
ALTER TABLE "public"."Empleados" DROP CONSTRAINT "Empleados_Usuarios_Id_usuario_fkey";

-- DropForeignKey
ALTER TABLE "public"."Platos" DROP CONSTRAINT "Platos_Fotos_Id_Foto_fkey";

-- DropForeignKey
ALTER TABLE "public"."Usuarios" DROP CONSTRAINT "Usuarios_Fotos_Id_Foto_fkey";

-- DropForeignKey
ALTER TABLE "public"."password_reset_tokens" DROP CONSTRAINT "password_reset_tokens_userId_fkey";

-- DropIndex
DROP INDEX "public"."Clientes_Personas_Id_Persona_Usuarios_Id_usuario_key";

-- DropIndex
DROP INDEX "public"."Clientes_Usuarios_Id_usuario_idx";

-- DropIndex
DROP INDEX "public"."Empleados_Personas_Id_Persona_Usuarios_Id_usuario_key";

-- DropIndex
DROP INDEX "public"."Empleados_Usuarios_Id_usuario_idx";

-- DropIndex
DROP INDEX "public"."Usuarios_Fotos_Id_Foto_idx";

-- AlterTable
ALTER TABLE "CartaDetalle" ADD COLUMN     "fotoId" INTEGER;

-- AlterTable
ALTER TABLE "Clientes" DROP COLUMN "Usuarios_Id_usuario",
ADD COLUMN     "usuarioId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Empleados" DROP COLUMN "Usuarios_Id_usuario",
ADD COLUMN     "usuarioId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Fotos" DROP CONSTRAINT "Fotos_pkey",
DROP COLUMN "Id_Foto",
DROP COLUMN "Ruta",
DROP COLUMN "Tipo",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "nombre" TEXT NOT NULL,
ADD COLUMN     "tipo" VARCHAR(50) NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL,
ADD CONSTRAINT "Fotos_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Personas" ALTER COLUMN "rol" SET DEFAULT 'CLIENTE';

-- AlterTable
ALTER TABLE "Platos" DROP COLUMN "Fotos_Id_Foto",
ADD COLUMN     "fotoId" INTEGER;

-- AlterTable
ALTER TABLE "Usuarios" DROP CONSTRAINT "Usuarios_pkey",
DROP COLUMN "Fotos_Id_Foto",
DROP COLUMN "Id_usuario",
ADD COLUMN     "emailVerificado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fotoId" INTEGER,
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "rol" SET DEFAULT 'CLIENTE',
ADD CONSTRAINT "Usuarios_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "public"."password_reset_tokens";

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailVerificationToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_token_idx" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_token_idx" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerificationToken_token_key" ON "EmailVerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerificationToken_userId_key" ON "EmailVerificationToken"("userId");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_token_idx" ON "EmailVerificationToken"("token");

-- CreateIndex
CREATE INDEX "Cartas_Usuarios_Id_usuario_idx" ON "Cartas"("Usuarios_Id_usuario");

-- CreateIndex
CREATE INDEX "Clientes_usuarioId_idx" ON "Clientes"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Clientes_Personas_Id_Persona_usuarioId_key" ON "Clientes"("Personas_Id_Persona", "usuarioId");

-- CreateIndex
CREATE INDEX "Empleados_usuarioId_idx" ON "Empleados"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Empleados_Personas_Id_Persona_usuarioId_key" ON "Empleados"("Personas_Id_Persona", "usuarioId");

-- CreateIndex
CREATE INDEX "Usuarios_rol_idx" ON "Usuarios"("rol");

-- AddForeignKey
ALTER TABLE "Usuarios" ADD CONSTRAINT "Usuarios_fotoId_fkey" FOREIGN KEY ("fotoId") REFERENCES "Fotos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Empleados" ADD CONSTRAINT "Empleados_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clientes" ADD CONSTRAINT "Clientes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Platos" ADD CONSTRAINT "Platos_fotoId_fkey" FOREIGN KEY ("fotoId") REFERENCES "Fotos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartaDetalle" ADD CONSTRAINT "CartaDetalle_fotoId_fkey" FOREIGN KEY ("fotoId") REFERENCES "Fotos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartaDetalle" ADD CONSTRAINT "CartaDetalle_Cartas_idCartas_fkey" FOREIGN KEY ("Cartas_idCartas") REFERENCES "Cartas"("idCartas") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cartas" ADD CONSTRAINT "Cartas_Usuarios_Id_usuario_fkey" FOREIGN KEY ("Usuarios_Id_usuario") REFERENCES "Usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailVerificationToken" ADD CONSTRAINT "EmailVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
