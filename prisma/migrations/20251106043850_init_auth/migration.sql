/*
  Warnings:

  - You are about to drop the column `Usuarios_Id_usuario` on the `Cartas` table. All the data in the column will be lost.
  - You are about to drop the column `Estados_Id_estado` on the `TurnosMenu` table. All the data in the column will be lost.
  - You are about to drop the column `Menu_Id_Menu` on the `TurnosMenu` table. All the data in the column will be lost.
  - You are about to drop the `Clientes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EmailVerificationToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Empleados` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PasswordResetToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Personas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RefreshToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Usuarios` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `EstadosId` to the `TurnosMenu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `MenuId` to the `TurnosMenu` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- DropForeignKey
ALTER TABLE "public"."Cartas" DROP CONSTRAINT "Cartas_Usuarios_Id_usuario_fkey";

-- DropForeignKey
ALTER TABLE "public"."Clientes" DROP CONSTRAINT "Clientes_Personas_Id_Persona_fkey";

-- DropForeignKey
ALTER TABLE "public"."Clientes" DROP CONSTRAINT "Clientes_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EmailVerificationToken" DROP CONSTRAINT "EmailVerificationToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Empleados" DROP CONSTRAINT "Empleados_Personas_Id_Persona_fkey";

-- DropForeignKey
ALTER TABLE "public"."Empleados" DROP CONSTRAINT "Empleados_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PasswordResetToken" DROP CONSTRAINT "PasswordResetToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RefreshToken" DROP CONSTRAINT "RefreshToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TurnosMenu" DROP CONSTRAINT "TurnosMenu_Estados_Id_estado_fkey";

-- DropForeignKey
ALTER TABLE "public"."TurnosMenu" DROP CONSTRAINT "TurnosMenu_Menu_Id_Menu_fkey";

-- DropForeignKey
ALTER TABLE "public"."Usuarios" DROP CONSTRAINT "Usuarios_fotoId_fkey";

-- DropIndex
DROP INDEX "public"."Cartas_Usuarios_Id_usuario_idx";

-- AlterTable
ALTER TABLE "Cartas" DROP COLUMN "Usuarios_Id_usuario";

-- AlterTable
ALTER TABLE "TurnosMenu" DROP COLUMN "Estados_Id_estado",
DROP COLUMN "Menu_Id_Menu",
ADD COLUMN     "EstadosId" INTEGER NOT NULL,
ADD COLUMN     "MenuId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "public"."Clientes";

-- DropTable
DROP TABLE "public"."EmailVerificationToken";

-- DropTable
DROP TABLE "public"."Empleados";

-- DropTable
DROP TABLE "public"."PasswordResetToken";

-- DropTable
DROP TABLE "public"."Personas";

-- DropTable
DROP TABLE "public"."RefreshToken";

-- DropTable
DROP TABLE "public"."Usuarios";

-- DropEnum
DROP TYPE "public"."Rol";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_dni_key" ON "User"("dni");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurnosMenu" ADD CONSTRAINT "TurnosMenu_EstadosId_fkey" FOREIGN KEY ("EstadosId") REFERENCES "Estados"("Id_estado") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurnosMenu" ADD CONSTRAINT "TurnosMenu_MenuId_fkey" FOREIGN KEY ("MenuId") REFERENCES "Menu"("Id_Menu") ON DELETE RESTRICT ON UPDATE CASCADE;
