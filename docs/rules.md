# rules.md
> Proyecto: **Restaurante**  
> Objetivo: centralizar reglas y criterios para construir, mantener y operar el sistema con calidad y velocidad.  
> Stack: SvelteKit 2 + Svelte 5, Prisma, PostgreSQL, Docker, Tailwind 4.  

---

## 1) Principios
1. **Entrega continua de valor**: features en vertical, pequeñas y testeadas.
2. **Seguridad por defecto**: mínimo privilegio, secretos fuera del repo.
3. **Simplicidad primero**: menos dependencias, menos magia.
4. **Observabilidad**: todo request debe ser rastreable.
5. **Automatizable**: scripts reproducibles para dev y CI.

---

## 2) Flujo de trabajo (Git)
- **Ramas**
  - `main`: estable. Solo merge por PR verde.
  - `develop` (opcional): integración continua.
  - `feat/<breve-descripcion>` para features.
  - `fix/<breve-descripcion>` para bugs.
  - `chore/<tarea>` para tareas no funcionales.
- **Commits (Conventional Commits)**
  - `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `perf:`, `test:`, `build:`, `ci:`
  - Ej.: `feat(platos): crear endpoint POST /api/platos`
- **Pull Requests**
  - Descripción corta + checklist (tests, docs, migraciones).
  - Requiere 1 aprobación mínima.
  - No se hacen merges “squash” si la historia de commits aporta contexto; usar `squash` solo para POCs/ruido.

---

## 3) Gestión de issues / HUs
- Toda tarea debe linkear a una **HU** en `docs/history.md`.
- Definir **criterios de aceptación** y **DoD** antes de codear.
- Estimar en **puntos** (1–8). Máximo 2 días por PR.

---

## 4) Entornos y variables
- `.env.example` es la **fuente de verdad** de las variables.
- Nunca subir `.env` reales. Usar **Docker secrets** en prod (cuando aplique).
- Variables mínimas:
  - `DATABASE_URL`
  - `STORAGE_DRIVER` (`disk`|`s3`)
  - `DISK_UPLOAD_DIR`
  - `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_PUBLIC_URL_BASE`
- Versionar scripts de arranque (`step-by-step.md`).

---

## 5) Base de datos y Prisma
- Toda modificación de esquema → `prisma migrate dev -n "<cambio>"`.
- No editar SQL generado a mano salvo casos justificados.
- **Nombres**: conservar nombres del dominio (Ids, FKs) tal como en `schema.prisma`.
- **Índices**: crear `@@index` en campos de búsqueda (ej. `NombrePlato`, `Fecha`).
- **Seeds**: idempotentes (`skipDuplicates: true`).
- **FKs en API**: validar existencia (ej. `Fotos_Id_Foto`) antes de escribir.
- **Transacciones**: usar `prisma.$transaction` para operaciones multi-tabla.

---

## 6) API (SvelteKit endpoints)
- Prefijo: `/api/*`.
- **Autenticación**: cookie httpOnly `sid` (luego JWT firmado).
- **Autorización**:
  - GET: autenticado (cualquier rol).
  - Mutaciones (POST/PUT/PATCH/DELETE): **Admin** (ajustable por ruta).
- **Contratos**:
  - JSON en request/response; `content-type: application/json` salvo uploads.
  - Códigos de estado correctos: `200/201/204`, `400/401/403/404/409/415/422`.
  - Validación con **Zod**. Respuestas de error legibles.
- **Nomenclatura**:
  - Recurso plural: `/api/platos`, `/api/cartas`.
  - Subrecurso: `/api/cartas/:id/detalle`.

---

## 7) Seguridad
- Cookies **httpOnly**, `sameSite=lax`, `secure` en prod.
- **No** se retornan contraseñas ni hashes.
- **Rate limit** a `/api/auth/login` (añadir en prod).
- Validar **MIME** de uploads y tamaños máximos.
- Sanitizar entradas y no interpolar SQL manual.
- CORS solo para orígenes permitidos en prod.

---

## 8) Subidas de imágenes (Fotos)
- Campo form-data: `file`.
- Tamaño máximo: **8MB** (ajustable por env).
- Tipos permitidos: `image/jpeg`, `image/png`, `image/webp`.
- **Storage**:
  - `disk`: guardar en `DISK_UPLOAD_DIR` y servir por `/uploads/*`.
  - `s3`: usar `@aws-sdk/client-s3` con ACL `public-read` o presigned URLs (futuro).
- En DB, **guardar `key`** (no URL). Retornar `url` público en la respuesta.

---

## 9) Frontend (Svelte 5 + Tailwind 4)
- Componentes reutilizables en `src/lib/components/*`.
- Estilos con Tailwind; evitar CSS global salvo tokens/utilidades.
- Accesibilidad mínima: labels asociados, teclas Enter/Espacio en elementos clicables.
- Formularios: validar en UI *y* en API (Zod).
- **ImageUploader**: disparo auto por defecto; usar `startUpload(file)` para flujos con crop.
- **ImageCropper**: ratio 1:1 por defecto; permitir cambios por prop `aspect`.

---

## 10) Errores y logging
- Todo endpoint debe retornar errores con mensaje claro y código correcto.
- Incluir `x-correlation-id` en request/response (hook ya lo setea).
- Log estructurado (añadir **pino** en prod). No loggear datos sensibles.

---

## 11) Testing
- **Unit**: funciones puras y esquemas Zod.
- **Integration**: endpoints `/api/platos`, `/api/fotos`, `/api/cartas`.
- **E2E**: flujo Carta del día (crear → agregar ítems → consultar).
- Semántica de tests: AAA (Arrange/Act/Assert). Nombres descriptivos.

---

## 12) Rendimiento
- Consultas con `select/include` mínimos.
- Paginación en listados grandes (futuro).
- Índices para campos de filtro/orden.
- Cache de lectura para cartas del día (futuro).

---

## 13) Accesibilidad & UX
- Focus visible, roles ARIA cuando corresponda.
- Controles accesibles con teclado.
- Feedback claro en errores y subidas (progreso/cancelación).

---

## 14) CI/CD (cuando se integre)
- Pasos mínimos:
  1. `npm ci`
  2. `prisma generate`
  3. lint + typecheck
  4. tests
  5. build
- No desplegar si hay migraciones pendientes no aplicadas.

---

## 15) Documentación
- `docs/history.md`: historias de usuario actualizadas.
- `docs/step-by-step.md`: instalación/arranque local.
- `docs/rules.md`: esta guía.
- Cada PR debe actualizar docs si afecta flujos, envs o endpoints.

---

## 16) Versionado y releases
- SemVer menor **solo** si hay cambios compatibles.
- Taggear releases en git (`vX.Y.Z`) y publicar changelog corto (features, fixes, DB).

---

## 17) Definición de Hecho (DoD)
- Código tipado, lints ok, tests relevantes pasan.
- Validaciones y errores cubiertos.
- Sin secretos en el repo.
- Docs y `.env.example` al día.
- Revisión cruzada hecha y aprobada.

---

## 18) Checklist para nuevas features
- [ ] HU en `history.md` con criterios BDD.
- [ ] Endpoint(s) con Zod y códigos correctos.
- [ ] RBAC revisado (hook o regla puntual).
- [ ] Migración/seed si aplica.
- [ ] UI (si corresponde) con validaciones.
- [ ] Tests (unit/integration/e2e, según aplique).
- [ ] Logs y manejo de errores.
- [ ] Documentación actualizada.

---

## 19) Convenciones de código
- **TypeScript** estricto.
- Import paths absolutos (`$lib/...`).
- Nombres: `PascalCase` para componentes/clases, `camelCase` funciones/variables, `SCREAMING_SNAKE_CASE` para consts globales.
- No usar `any` salvo justificación. Preferir tipos exactos retornados por Prisma.

---

## 20) Roadmap resumido (para alinear trabajo)
1. JWT firmado + índices + logs pino.
2. UI Catálogo (Platos + Tipos).
3. UI Menú/Turnos/Especialidades + asociaciones.
4. UI Cartas del día + consulta filtrada.
5. PWA (opcional) + métricas.

---

> **Recordatorio:** si algo no está en estas reglas, votar en PR y documentar la decisión. Mantener este archivo como contrato vivo del equipo.
