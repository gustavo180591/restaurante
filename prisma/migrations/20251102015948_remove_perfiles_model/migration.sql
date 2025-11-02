/*
  Warnings:

  - You are about to drop the column `Id_Perfil` on the `Personas` table. All the data in the column will be lost.
  - You are about to drop the column `Perfiles_Id_Perfil` on the `Usuarios` table. All the data in the column will be lost.
  - You are about to drop the `Perfiles` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('admin', 'operador', 'mozo', 'cliente');

-- DropForeignKey
ALTER TABLE "public"."Personas" DROP CONSTRAINT "Personas_Id_Perfil_fkey";

-- DropForeignKey
ALTER TABLE "public"."Usuarios" DROP CONSTRAINT "Usuarios_Perfiles_Id_Perfil_fkey";

-- AlterTable
ALTER TABLE "Personas" DROP COLUMN "Id_Perfil",
ADD COLUMN     "rol" "Rol" NOT NULL DEFAULT 'cliente';

-- AlterTable
ALTER TABLE "Usuarios" DROP COLUMN "Perfiles_Id_Perfil";

-- DropTable
DROP TABLE "public"."Perfiles";
