# history.md
> Proyecto: **Restaurante** — Gestión de menú, turnos, especialidades, platos y cartas del día.  
> Stack: SvelteKit 2 + Svelte 5, Prisma, PostgreSQL, Docker, Tailwind 4.  
> Modelo de datos: `Usuarios`, `Perfiles`, `Personas`, `Empleados`, `Clientes`, `Fotos`, `Platos`, `TipoPlato`, `Menu`, `Estados`, `TurnosMenu`, `Especialidades`, `MenuEspecialidad`, `MenuEspTipoPlato`, `Platos_has_MenuEspTipoPlato`, `Cartas`, `CartaDetalle`.

---

## Roles
- **Admin**: configuración y catálogo (ABM completo).
- **Operador**: operación diaria (cartas, asociación de platos, consulta).
- **Mozo**: consulta (lectura).
- **Cliente (público)**: consulta de carta (opcional futuro).

---

## Épicas
1. **Acceso y perfiles** (Usuarios, Perfiles, Fotos).
2. **Identidades** (Personas, Empleados, Clientes).
3. **Catálogo de platos** (Platos, Fotos, TipoPlato).
4. **Estructura de menú** (Menu, Estados, TurnosMenu, Especialidades, MenuEspecialidad, MenuEspTipoPlato).
5. **Cartas del día** (Cartas, Platos_has_MenuEspTipoPlato, CartaDetalle).
6. **Operación y control** (activación de turnos, auditoría mínima).

---

## Historias de usuario (BDD)

### EP1 — Acceso y perfiles

#### HU-001 — Registro de usuario
**Como** Admin **quiero** crear usuarios con perfil y foto opcional **para** habilitar acceso controlado.
```
Dado que estoy autenticado como Admin
Y completo usuario, clave y perfil válido
Cuando guardo el usuario
Entonces se crea en Usuarios con Perfiles_Id_Perfil asociado
Y si adjunto una foto válida se crea en Fotos y se vincula al usuario
Y la clave queda hasheada
```
**Definición de Hecho**
- Validaciones Zod.
- Clave con bcrypt/argon2.
- Unicidad `Usuarios.usuario`.
- Respuesta 201 con id.

#### HU-002 — Login
**Como** usuario **quiero** iniciar sesión **para** acceder según mi rol.
```
Dado un usuario y clave correctos
Cuando inicio sesión en /api/auth/login
Entonces recibo cookie de sesión httpOnly
Y mi rol queda disponible en la sesión
```
**DoD**
- 401 en credenciales inválidas.
- Cookie segura y expiración.

---

### EP2 — Identidades

#### HU-010 — Alta de Persona y Empleado
**Como** Admin **quiero** registrar una Persona y vincular un Empleado **para** habilitar funciones internas.
```
Dado datos válidos de Persona (dni, nombres, apellidos, género, teléfono)
Cuando guardo
Entonces se crea Personas
Y si indico un usuario existente se crea Empleados ligado a la persona y usuario
```

#### HU-011 — Alta de Cliente
**Como** Operador **quiero** registrar un Cliente vinculado a una Persona **para** futuras operaciones.
```
Dado una Persona existente
Cuando creo Cliente
Entonces se guarda en Clientes con FKs correctas
```

---

### EP3 — Catálogo de platos

#### HU-020 — Crear/Editar Plato con imagen
**Como** Admin **quiero** crear/editar platos con nombre, precio y foto **para** mantener el catálogo.
```
Dado un nombre <= 95 y precio decimal válido
Y una imagen subida a /api/fotos que devuelve {id}
Cuando creo/edito el Plato usando ese id como Fotos_Id_Foto
Entonces el sistema valida que la imagen exista
Y guarda el Plato con su foto asociada
```
**DoD**
- 400 si `Fotos_Id_Foto` no existe.
- 201/200 con payload del plato.

#### HU-021 — Gestionar Tipos de Plato
**Como** Admin **quiero** administrar Tipos de Plato **para** clasificar la oferta.
```
Dado un nombre de tipo válido (<=45)
Cuando guardo
Entonces el tipo se crea en TipoPlato
```

#### HU-022 — Subir imagen (Fotos)
**Como** usuario autenticado **quiero** subir una imagen **para** asociarla a usuarios o platos.
```
Dado un archivo imagen válido
Cuando POST /api/fotos con multipart "file"
Entonces se sube al storage (S3 o disco)
Y se crea un registro en Fotos
Y recibo { id, url, key, mime }
```
**DoD**
- 415 si no es imagen.
- 401 si no autenticado.

---

### EP4 — Estructura de menú

#### HU-030 — Crear Menú
**Como** Admin **quiero** crear menús **para** organizar la oferta.
```
Dado un nombre válido de Menú
Cuando lo creo
Entonces queda disponible en Menu
```

#### HU-031 — Crear Estados
**Como** Admin **quiero** gestionar estados (Activo/Inactivo) **para** controlar disponibilidad.
```
Dado un NombEstado válido
Cuando lo creo
Entonces queda en Estados
```

#### HU-032 — Definir Turnos de Menú
**Como** Admin **quiero** crear Turnos asociados a un Menú y Estado **para** limitar disponibilidad temporal.
```
Dado un Menú y un Estado existentes
Cuando creo TurnosMenu con HoraTurno
Entonces queda vinculado a Menu y Estados
```

#### HU-033 — Asociar Especialidades a Turno
**Como** Admin **quiero** asociar Especialidades a un Turno **para** segmentar la carta.
```
Dado un Turno y una Especialidad
Cuando creo MenuEspecialidad
Entonces quedan asociados
```

#### HU-034 — Habilitar Tipos por Especialidad
**Como** Admin **quiero** habilitar Tipos de Plato por Especialidad/Turno **para** componer la oferta.
```
Dado MenuEspecialidad y TipoPlato
Cuando creo MenuEspTipoPlato
Entonces el tipo queda habilitado en ese contexto
```

---

### EP5 — Cartas del día

#### HU-040 — Crear Carta del día
**Como** Operador **quiero** crear una Carta con fecha **para** publicar la oferta del día.
```
Dado una fecha (YYYY-MM-DD)
Cuando POST /api/cartas
Entonces se crea Cartas con la fecha y el usuario creador
```

#### HU-041 — Agregar ítems a la Carta
**Como** Operador **quiero** agregar ítems a la Carta combinando Plato + contexto de Menú **para** completar la oferta diaria.
```
Dado un Plato y un MenuEspTipoPlato válidos
Cuando POST /api/cartas/:id/detalle
Entonces se asegura (o crea) la combinación en Platos_has_MenuEspTipoPlato
Y se crea CartaDetalle apuntando a esa combinación
Y se evita duplicar el mismo Id_PlatoCarta en la misma Carta
```
**DoD**
- 409 si ya existe en la carta.
- 404 si la carta no existe (caso a implementar según negocio).

#### HU-042 — Consultar Carta filtrada
**Como** Mozo/Cliente **quiero** consultar la carta por fecha, turno y especialidad **para** ver disponibilidad.
```
Dado fecha y filtros opcionales de turno y especialidad
Cuando GET /api/cartas?fecha=YYYY-MM-DD&turnoId=&especialidadId=
Entonces recibo los platos de la carta que coinciden con los filtros
Y no se listan turnos inactivos (extensión futura)
```

---

### EP6 — Operación y control

#### HU-050 — Activar/Inactivar Turno
**Como** Admin **quiero** activar o inactivar un turno **para** controlar disponibilidad en tiempo real.
```
Dado un turno existente
Cuando cambio su estado a Inactivo
Entonces deja de ofrecerse en las consultas de carta
```

#### HU-051 — Auditoría mínima
**Como** Admin **quiero** registrar altas/bajas/ediciones clave **para** control operativo.
```
Dado una operación de catálogo o carta
Cuando se ejecuta
Entonces se registra usuario, acción y timestamp (MVP: logs app; futuro: tabla)
```

---

## Mapeo a endpoints (contratos)

- **Auth**
  - `POST /api/auth/login` → { role }
  - `POST /api/auth/logout`
- **Platos**
  - `GET /api/platos`
  - `POST /api/platos` (valida `Fotos_Id_Foto`)
  - `GET|PUT|DELETE /api/platos/:id`
- **Tipos de Plato**
  - `GET|POST /api/tipos-plato`
- **Menú / Estados / Turnos**
  - `GET|POST /api/menu`
  - `GET|POST /api/estados`
  - `GET|POST /api/turnos`
- **Especialidades / Asociaciones**
  - `GET|POST /api/especialidades`
  - `POST /api/menu-especialidad`
  - `POST /api/menu-esp-tipo`
- **Cartas**
  - `GET|POST /api/cartas`
  - `POST /api/cartas/:id/detalle`
- **Media**
  - `POST /api/fotos` (multipart) → { id, url, key, mime }
  - `GET /uploads/*` (cuando STORAGE_DRIVER=disk)
- **Health**
  - `GET /health`

---

## Reglas de negocio clave

- **RBAC**: rutas `/api/*` requieren sesión; mutaciones reservadas a **Admin** (configurable por ruta).
- **Imágenes**: sólo `image/*`; en disco se sirven por `/uploads/*`; en S3 se devuelve URL pública.
- **Carta**: no duplicar el mismo `Id_PlatoCarta` en una misma `Cartas`.
- **Relaciones**: validación FK de `Fotos_Id_Foto` en creación/edición de `Platos`.

---

## Definiciones de Hecho (DoD)
- Validaciones Zod.
- Respuestas con códigos correctos (200/201/204, 400/401/403/404/409).
- Logs básicos y `x-correlation-id`.
- Migraciones Prisma aplicadas y `prisma generate` actualizado.
- Tests de humo (login, fotos, platos, carta).

---

## No funcionales (MVP)
- Seguridad: cookie httpOnly, CORS básico.
- Rendimiento: índices en campos de búsqueda (a planificar).
- Observabilidad: `/health` + logs.

---

## Fuera de alcance (por ahora)
- PWA público, Analytics, Presupuestos/ventas, Pagos, Reserva de mesas.
- Soft-delete y auditoría completa.
- Autenticación social/externa.

---

## Roadmap (alto nivel)
1. **Endurecer base**: JWT real, índices, logger pino.
2. **Catálogo completo**: UI Platos + Tipos, uploads robustos.
3. **Menú & Turnos & Especialidades**: UI y asociaciones.
4. **Cartas**: UI operativa + filtros; E2E del flujo.
5. **PWA (opcional)**: consulta pública y offline.

---
