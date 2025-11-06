/*
  Warnings:

  - A unique constraint covering the columns `[Personas_Id_Persona,Usuarios_Id_usuario]` on the table `Clientes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[Personas_Id_Persona,Usuarios_Id_usuario]` on the table `Empleados` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[dni]` on the table `Personas` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[usuario]` on the table `Usuarios` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Usuarios` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."Clientes" DROP CONSTRAINT "Clientes_Personas_Id_Persona_fkey";

-- DropForeignKey
ALTER TABLE "public"."Clientes" DROP CONSTRAINT "Clientes_Usuarios_Id_usuario_fkey";

-- DropForeignKey
ALTER TABLE "public"."Empleados" DROP CONSTRAINT "Empleados_Personas_Id_Persona_fkey";

-- DropForeignKey
ALTER TABLE "public"."Empleados" DROP CONSTRAINT "Empleados_Usuarios_Id_usuario_fkey";

-- AlterTable
ALTER TABLE "Usuarios" ADD COLUMN     "rol" "Rol" NOT NULL DEFAULT 'cliente';

-- CreateIndex
CREATE INDEX "Clientes_Personas_Id_Persona_idx" ON "Clientes"("Personas_Id_Persona");

-- CreateIndex
CREATE INDEX "Clientes_Usuarios_Id_usuario_idx" ON "Clientes"("Usuarios_Id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "Clientes_Personas_Id_Persona_Usuarios_Id_usuario_key" ON "Clientes"("Personas_Id_Persona", "Usuarios_Id_usuario");

-- CreateIndex
CREATE INDEX "Empleados_Personas_Id_Persona_idx" ON "Empleados"("Personas_Id_Persona");

-- CreateIndex
CREATE INDEX "Empleados_Usuarios_Id_usuario_idx" ON "Empleados"("Usuarios_Id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "Empleados_Personas_Id_Persona_Usuarios_Id_usuario_key" ON "Empleados"("Personas_Id_Persona", "Usuarios_Id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "Personas_dni_key" ON "Personas"("dni");

-- CreateIndex
CREATE INDEX "Personas_dni_idx" ON "Personas"("dni");

-- CreateIndex
CREATE INDEX "Personas_email_idx" ON "Personas"("email");

-- CreateIndex
CREATE INDEX "Personas_rol_idx" ON "Personas"("rol");

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_usuario_key" ON "Usuarios"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_email_key" ON "Usuarios"("email");

-- CreateIndex
CREATE INDEX "Usuarios_usuario_idx" ON "Usuarios"("usuario");

-- CreateIndex
CREATE INDEX "Usuarios_email_idx" ON "Usuarios"("email");

-- CreateIndex
CREATE INDEX "Usuarios_Fotos_Id_Foto_idx" ON "Usuarios"("Fotos_Id_Foto");

-- AddForeignKey
ALTER TABLE "Empleados" ADD CONSTRAINT "Empleados_Personas_Id_Persona_fkey" FOREIGN KEY ("Personas_Id_Persona") REFERENCES "Personas"("Id_Persona") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Empleados" ADD CONSTRAINT "Empleados_Usuarios_Id_usuario_fkey" FOREIGN KEY ("Usuarios_Id_usuario") REFERENCES "Usuarios"("Id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clientes" ADD CONSTRAINT "Clientes_Personas_Id_Persona_fkey" FOREIGN KEY ("Personas_Id_Persona") REFERENCES "Personas"("Id_Persona") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clientes" ADD CONSTRAINT "Clientes_Usuarios_Id_usuario_fkey" FOREIGN KEY ("Usuarios_Id_usuario") REFERENCES "Usuarios"("Id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;
