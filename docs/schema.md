// ---------------------------------------------------------
// Prisma schema generado desde el DER de la imagen
// (motor: PostgreSQL)
// ---------------------------------------------------------

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ---------------------- Catálogos / básicos ----------------------

model Perfiles {
  Id_Perfil     Int       @id @default(autoincrement())
  NombrePerfil  String    @db.VarChar(55)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // relaciones
  Usuarios      Usuarios[]
}

model Fotos {
  Id_Foto  Int      @id @default(autoincrement())
  Ruta     String   @db.VarChar(255)
  Tipo     String   @db.VarChar(100)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // relaciones inversas
  Usuarios Usuarios[]
  Platos   Platos[]
}

model Estados {
  Id_estado    Int      @id @default(autoincrement())
  NombEstado   String   @db.VarChar(100)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  TurnosMenu   TurnosMenu[]
}

model Menu {
  Id_Menu     Int          @id @default(autoincrement())
  NombreMenu  String       @db.VarChar(100)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  Turnos      TurnosMenu[]
}

model Especialidades {
  Id_especialidad     Int                 @id @default(autoincrement())
  NombreEspecialidad  String              @db.VarChar(100)
  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt

  MenuEspecialidad    MenuEspecialidad[]
}

model TipoPlato {
  Id_TipoPlato  Int                 @id @default(autoincrement())
  NombreTipo    String              @db.VarChar(100)
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt

  MenuEspTipoPlato MenuEspTipoPlato[]
}

// ---------------------- Personas / usuarios ----------------------

model Personas {
  Id_Persona  Int        @id @default(autoincrement())
  dni         String     @db.VarChar(15)
  nombres     String     @db.VarChar(100)
  Apellidos   String     @db.VarChar(100)
  genero      Int
  Telefono    String     @db.VarChar(15)
  email       String?    @db.VarChar(100)
  direccion   String?    @db.VarChar(255)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  // inversas
  Empleados   Empleados[]
  Clientes    Clientes[]
}

model Usuarios {
  Id_usuario        Int       @id @default(autoincrement())
  usuario           String    @db.VarChar(100)
  clave             String    @db.VarChar(255)
  sessionVersion    Int       @default(1)
  email             String?   @db.VarChar(255)
  activo            Boolean   @default(true)
  ultimoAcceso      DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // FKs
  Perfiles_Id_Perfil Int
  Fotos_Id_Foto      Int?

  // relaciones
  perfil  Perfiles @relation(fields: [Perfiles_Id_Perfil], references: [Id_Perfil], onUpdate: Cascade, onDelete: Restrict)
  foto    Fotos?   @relation(fields: [Fotos_Id_Foto], references: [Id_Foto], onUpdate: Cascade, onDelete: SetNull)

  // inversas
  Empleados Empleados[]
  Clientes  Clientes[]
  Cartas    Cartas[]
}

model Empleados {
  Id_empleado         Int       @id @default(autoincrement())

  // FKs
  Personas_Id_Persona Int
  Usuarios_Id_usuario Int

  // relaciones
  persona Personas @relation(fields: [Personas_Id_Persona], references: [Id_Persona], onUpdate: Cascade, onDelete: Restrict)
  usuario Usuarios @relation(fields: [Usuarios_Id_usuario], references: [Id_usuario], onUpdate: Cascade, onDelete: Restrict)
}

model Clientes {
  Id_Cliente          Int       @id @default(autoincrement())

  // FKs
  Personas_Id_Persona Int
  Usuarios_Id_usuario Int

  // relaciones
  persona Personas @relation(fields: [Personas_Id_Persona], references: [Id_Persona], onUpdate: Cascade, onDelete: Restrict)
  usuario Usuarios @relation(fields: [Usuarios_Id_usuario], references: [Id_usuario], onUpdate: Cascade, onDelete: Restrict)
}

// ---------------------- Menú / cartas / platos ----------------------

model Platos {
  Id_Plato      Int       @id @default(autoincrement())
  NombrePlato   String    @db.VarChar(255)
  Descripcion   String?   @db.Text
  Precio        Decimal   @db.Decimal(10, 2)
  Activo        Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // FKs
  Fotos_Id_Foto Int?

  // relaciones
  foto Fotos? @relation(fields: [Fotos_Id_Foto], references: [Id_Foto], onUpdate: Cascade, onDelete: SetNull)

  // inversas
  Platos_has_MenuEspTipoPlato Platos_has_MenuEspTipoPlato[]
}

model Cartas {
  idCartas            Int            @id @default(autoincrement())
  Fecha               DateTime       @db.Date
  Estado              String         @default("activa") @db.VarChar(50)
  Notas               String?        @db.Text
  Total               Decimal?       @db.Decimal(12, 2)
  createdAt           DateTime       @default(now())
  updatedAt           DateTime       @updatedAt

  // FKs
  Usuarios_Id_usuario Int

  // relaciones
  usuario      Usuarios     @relation(fields: [Usuarios_Id_usuario], references: [Id_usuario], onUpdate: Cascade, onDelete: Restrict)
  CartaDetalle CartaDetalle[]
}

model MenuEspecialidad {
  Id_MenuEspecialidad       Int       @id @default(autoincrement())
  createdAt                 DateTime  @default(now())
  updatedAt                 DateTime  @updatedAt

  // FKs
  Especialidades_Id_especialidad Int
  TurnosMenu_Id_Turno           Int

  // relaciones
  especialidad Especialidades @relation(fields: [Especialidades_Id_especialidad], references: [Id_especialidad], onUpdate: Cascade, onDelete: Restrict)
  turno        TurnosMenu     @relation(fields: [TurnosMenu_Id_Turno], references: [Id_Turno], onUpdate: Cascade, onDelete: Restrict)

  // inversa
  MenuEspTipoPlato MenuEspTipoPlato[]
}

model TurnosMenu {
  Id_Turno          Int        @id @default(autoincrement())
  HoraInicio        DateTime   @db.Time
  HoraFin           DateTime   @db.Time
  Nombre            String     @db.VarChar(100)
  Descripcion       String?    @db.VarChar(255)
  Activo            Boolean    @default(true)
  createdAt         DateTime   @default(now())
  updatedAt         DateTime   @updatedAt

  // FKs
  Menu_Id_Menu      Int
  Estados_Id_estado Int

  // relaciones
  menu    Menu    @relation(fields: [Menu_Id_Menu], references: [Id_Menu], onUpdate: Cascade, onDelete: Restrict)
  estado  Estados @relation(fields: [Estados_Id_estado], references: [Id_estado], onUpdate: Cascade, onDelete: Restrict)

  // inversa
  MenuEspecialidad MenuEspecialidad[]
}

model MenuEspTipoPlato {
  Id_MenuEspTipoPlato              Int  @id @default(autoincrement())

  // FKs
  MenuEspecialidad_Id_MenuEspecialidad Int
  TipoPlato_Id_TipoPlato               Int

  // relaciones
  menuEspecialidad MenuEspecialidad @relation(fields: [MenuEspecialidad_Id_MenuEspecialidad], references: [Id_MenuEspecialidad], onUpdate: Cascade, onDelete: Restrict)
  tipoPlato        TipoPlato        @relation(fields: [TipoPlato_Id_TipoPlato], references: [Id_TipoPlato], onUpdate: Cascade, onDelete: Restrict)

  // inversa
  Platos_has_MenuEspTipoPlato Platos_has_MenuEspTipoPlato[]
}

model Platos_has_MenuEspTipoPlato {
  // La imagen muestra PK: Id_PlatoCarta (VARCHAR(45))
  Id_PlatoCarta                         String @id @db.VarChar(45)

  // FKs
  Platos_Id_Plato                       Int
  MenuEspTipoPlato_Id_MenuEspTipoPlato  Int

  // relaciones
  plato           Platos           @relation(fields: [Platos_Id_Plato], references: [Id_Plato], onUpdate: Cascade, onDelete: Restrict)
  menuEspTipo     MenuEspTipoPlato @relation(fields: [MenuEspTipoPlato_Id_MenuEspTipoPlato], references: [Id_MenuEspTipoPlato], onUpdate: Cascade, onDelete: Restrict)

  // inversa
  CartaDetalle    CartaDetalle[]
}

model CartaDetalle {
  idCartaDetalle Int     @id @default(autoincrement())

  // FKs
  Platos_has_MenuEspTipoPlato_Id_PlatoCarta String
  Cartas_idCartas                           Int

  // relaciones
  platoCarta Platos_has_MenuEspTipoPlato @relation(fields: [Platos_has_MenuEspTipoPlato_Id_PlatoCarta], references: [Id_PlatoCarta], onUpdate: Cascade, onDelete: Restrict)
  carta      Cartas                      @relation(fields: [Cartas_idCartas], references: [idCartas], onUpdate: Cascade, onDelete: Cascade)
}
