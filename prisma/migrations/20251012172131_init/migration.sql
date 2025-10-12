-- CreateTable
CREATE TABLE "Perfiles" (
    "Id_Perfil" SERIAL NOT NULL,
    "NombrePerfil" VARCHAR(55) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Perfiles_pkey" PRIMARY KEY ("Id_Perfil")
);

-- CreateTable
CREATE TABLE "Fotos" (
    "Id_Foto" SERIAL NOT NULL,
    "Ruta" VARCHAR(255) NOT NULL,
    "Tipo" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fotos_pkey" PRIMARY KEY ("Id_Foto")
);

-- CreateTable
CREATE TABLE "Estados" (
    "Id_estado" SERIAL NOT NULL,
    "NombEstado" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Estados_pkey" PRIMARY KEY ("Id_estado")
);

-- CreateTable
CREATE TABLE "Menu" (
    "Id_Menu" SERIAL NOT NULL,
    "NombreMenu" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("Id_Menu")
);

-- CreateTable
CREATE TABLE "Especialidades" (
    "Id_especialidad" SERIAL NOT NULL,
    "NombreEspecialidad" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Especialidades_pkey" PRIMARY KEY ("Id_especialidad")
);

-- CreateTable
CREATE TABLE "TipoPlato" (
    "Id_TipoPlato" SERIAL NOT NULL,
    "NombreTipo" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TipoPlato_pkey" PRIMARY KEY ("Id_TipoPlato")
);

-- CreateTable
CREATE TABLE "Personas" (
    "Id_Persona" SERIAL NOT NULL,
    "dni" VARCHAR(15) NOT NULL,
    "nombres" VARCHAR(100) NOT NULL,
    "Apellidos" VARCHAR(100) NOT NULL,
    "genero" INTEGER NOT NULL,
    "Telefono" VARCHAR(15) NOT NULL,
    "email" VARCHAR(100),
    "direccion" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Personas_pkey" PRIMARY KEY ("Id_Persona")
);

-- CreateTable
CREATE TABLE "Usuarios" (
    "Id_usuario" SERIAL NOT NULL,
    "usuario" VARCHAR(100) NOT NULL,
    "clave" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimoAcceso" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "Perfiles_Id_Perfil" INTEGER NOT NULL,
    "Fotos_Id_Foto" INTEGER,

    CONSTRAINT "Usuarios_pkey" PRIMARY KEY ("Id_usuario")
);

-- CreateTable
CREATE TABLE "Empleados" (
    "Id_empleado" SERIAL NOT NULL,
    "Personas_Id_Persona" INTEGER NOT NULL,
    "Usuarios_Id_usuario" INTEGER NOT NULL,

    CONSTRAINT "Empleados_pkey" PRIMARY KEY ("Id_empleado")
);

-- CreateTable
CREATE TABLE "Clientes" (
    "Id_Cliente" SERIAL NOT NULL,
    "Personas_Id_Persona" INTEGER NOT NULL,
    "Usuarios_Id_usuario" INTEGER NOT NULL,

    CONSTRAINT "Clientes_pkey" PRIMARY KEY ("Id_Cliente")
);

-- CreateTable
CREATE TABLE "Platos" (
    "Id_Plato" SERIAL NOT NULL,
    "NombrePlato" VARCHAR(255) NOT NULL,
    "Descripcion" TEXT,
    "Precio" DECIMAL(10,2) NOT NULL,
    "Activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "Fotos_Id_Foto" INTEGER,

    CONSTRAINT "Platos_pkey" PRIMARY KEY ("Id_Plato")
);

-- CreateTable
CREATE TABLE "Cartas" (
    "idCartas" SERIAL NOT NULL,
    "Fecha" DATE NOT NULL,
    "Estado" VARCHAR(50) NOT NULL DEFAULT 'activa',
    "Notas" TEXT,
    "Total" DECIMAL(12,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "Usuarios_Id_usuario" INTEGER NOT NULL,

    CONSTRAINT "Cartas_pkey" PRIMARY KEY ("idCartas")
);

-- CreateTable
CREATE TABLE "MenuEspecialidad" (
    "Id_MenuEspecialidad" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "Especialidades_Id_especialidad" INTEGER NOT NULL,
    "TurnosMenu_Id_Turno" INTEGER NOT NULL,

    CONSTRAINT "MenuEspecialidad_pkey" PRIMARY KEY ("Id_MenuEspecialidad")
);

-- CreateTable
CREATE TABLE "TurnosMenu" (
    "Id_Turno" SERIAL NOT NULL,
    "HoraInicio" TIME NOT NULL,
    "HoraFin" TIME NOT NULL,
    "Nombre" VARCHAR(100) NOT NULL,
    "Descripcion" VARCHAR(255),
    "Activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "Menu_Id_Menu" INTEGER NOT NULL,
    "Estados_Id_estado" INTEGER NOT NULL,

    CONSTRAINT "TurnosMenu_pkey" PRIMARY KEY ("Id_Turno")
);

-- CreateTable
CREATE TABLE "MenuEspTipoPlato" (
    "Id_MenuEspTipoPlato" SERIAL NOT NULL,
    "MenuEspecialidad_Id_MenuEspecialidad" INTEGER NOT NULL,
    "TipoPlato_Id_TipoPlato" INTEGER NOT NULL,

    CONSTRAINT "MenuEspTipoPlato_pkey" PRIMARY KEY ("Id_MenuEspTipoPlato")
);

-- CreateTable
CREATE TABLE "Platos_has_MenuEspTipoPlato" (
    "Id_PlatoCarta" VARCHAR(45) NOT NULL,
    "Platos_Id_Plato" INTEGER NOT NULL,
    "MenuEspTipoPlato_Id_MenuEspTipoPlato" INTEGER NOT NULL,

    CONSTRAINT "Platos_has_MenuEspTipoPlato_pkey" PRIMARY KEY ("Id_PlatoCarta")
);

-- CreateTable
CREATE TABLE "CartaDetalle" (
    "idCartaDetalle" SERIAL NOT NULL,
    "Platos_has_MenuEspTipoPlato_Id_PlatoCarta" TEXT NOT NULL,
    "Cartas_idCartas" INTEGER NOT NULL,

    CONSTRAINT "CartaDetalle_pkey" PRIMARY KEY ("idCartaDetalle")
);

-- AddForeignKey
ALTER TABLE "Usuarios" ADD CONSTRAINT "Usuarios_Perfiles_Id_Perfil_fkey" FOREIGN KEY ("Perfiles_Id_Perfil") REFERENCES "Perfiles"("Id_Perfil") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuarios" ADD CONSTRAINT "Usuarios_Fotos_Id_Foto_fkey" FOREIGN KEY ("Fotos_Id_Foto") REFERENCES "Fotos"("Id_Foto") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Empleados" ADD CONSTRAINT "Empleados_Personas_Id_Persona_fkey" FOREIGN KEY ("Personas_Id_Persona") REFERENCES "Personas"("Id_Persona") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Empleados" ADD CONSTRAINT "Empleados_Usuarios_Id_usuario_fkey" FOREIGN KEY ("Usuarios_Id_usuario") REFERENCES "Usuarios"("Id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clientes" ADD CONSTRAINT "Clientes_Personas_Id_Persona_fkey" FOREIGN KEY ("Personas_Id_Persona") REFERENCES "Personas"("Id_Persona") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clientes" ADD CONSTRAINT "Clientes_Usuarios_Id_usuario_fkey" FOREIGN KEY ("Usuarios_Id_usuario") REFERENCES "Usuarios"("Id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Platos" ADD CONSTRAINT "Platos_Fotos_Id_Foto_fkey" FOREIGN KEY ("Fotos_Id_Foto") REFERENCES "Fotos"("Id_Foto") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cartas" ADD CONSTRAINT "Cartas_Usuarios_Id_usuario_fkey" FOREIGN KEY ("Usuarios_Id_usuario") REFERENCES "Usuarios"("Id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuEspecialidad" ADD CONSTRAINT "MenuEspecialidad_Especialidades_Id_especialidad_fkey" FOREIGN KEY ("Especialidades_Id_especialidad") REFERENCES "Especialidades"("Id_especialidad") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuEspecialidad" ADD CONSTRAINT "MenuEspecialidad_TurnosMenu_Id_Turno_fkey" FOREIGN KEY ("TurnosMenu_Id_Turno") REFERENCES "TurnosMenu"("Id_Turno") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurnosMenu" ADD CONSTRAINT "TurnosMenu_Menu_Id_Menu_fkey" FOREIGN KEY ("Menu_Id_Menu") REFERENCES "Menu"("Id_Menu") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurnosMenu" ADD CONSTRAINT "TurnosMenu_Estados_Id_estado_fkey" FOREIGN KEY ("Estados_Id_estado") REFERENCES "Estados"("Id_estado") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuEspTipoPlato" ADD CONSTRAINT "MenuEspTipoPlato_MenuEspecialidad_Id_MenuEspecialidad_fkey" FOREIGN KEY ("MenuEspecialidad_Id_MenuEspecialidad") REFERENCES "MenuEspecialidad"("Id_MenuEspecialidad") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuEspTipoPlato" ADD CONSTRAINT "MenuEspTipoPlato_TipoPlato_Id_TipoPlato_fkey" FOREIGN KEY ("TipoPlato_Id_TipoPlato") REFERENCES "TipoPlato"("Id_TipoPlato") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Platos_has_MenuEspTipoPlato" ADD CONSTRAINT "Platos_has_MenuEspTipoPlato_Platos_Id_Plato_fkey" FOREIGN KEY ("Platos_Id_Plato") REFERENCES "Platos"("Id_Plato") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Platos_has_MenuEspTipoPlato" ADD CONSTRAINT "Platos_has_MenuEspTipoPlato_MenuEspTipoPlato_Id_MenuEspTip_fkey" FOREIGN KEY ("MenuEspTipoPlato_Id_MenuEspTipoPlato") REFERENCES "MenuEspTipoPlato"("Id_MenuEspTipoPlato") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartaDetalle" ADD CONSTRAINT "CartaDetalle_Platos_has_MenuEspTipoPlato_Id_PlatoCarta_fkey" FOREIGN KEY ("Platos_has_MenuEspTipoPlato_Id_PlatoCarta") REFERENCES "Platos_has_MenuEspTipoPlato"("Id_PlatoCarta") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartaDetalle" ADD CONSTRAINT "CartaDetalle_Cartas_idCartas_fkey" FOREIGN KEY ("Cartas_idCartas") REFERENCES "Cartas"("idCartas") ON DELETE CASCADE ON UPDATE CASCADE;
