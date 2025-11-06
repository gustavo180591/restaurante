# Flujo de Autenticación - Inicio de Sesión

## 1. Interfaz de Usuario

### Página de Inicio de Sesión (`/login`)

**Componente Principal:** `src/routes/login/+page.svelte`

**Campos del Formulario:**
- [x] **Email/Usuario** (requerido)
- [x] **Contraseña** (requerido)
- [x] **Recordarme** (opcional)

**Validaciones del Lado del Cliente:**
- [x] Email/Usuario no puede estar vacío
- [x] Contraseña debe tener al menos 6 caracteres

## 2. Proceso de Autenticación

### 2.1. Envío de Credenciales
- [x] **Endpoint:** `POST /api/auth/login`
- [x] **Content-Type:** `application/json`
- [x] **Body:**
  ```json
  {
    "email": "usuario@ejemplo.com",
    "password": "contraseña123",
    "rememberMe": false
  }
  ```

### 2.2. Verificación en el Servidor
1. [x] Validación de campos requeridos
2. [x] Búsqueda del usuario por email o nombre de usuario
3. [x] Verificación de la contraseña con bcrypt
4. [x] Verificación de cuenta activa
5. [x] Verificación de perfil asociado (Cliente/Empleado)

### 2.3. Creación de Sesión
1. [x] Generación de token JWT con:
   - [x] `sub`: ID del usuario
   - [x] `sv`: Versión de sesión
   - [x] `roles`: Roles del usuario
   - [x] `exp`: Tiempo de expiración (7 días por defecto)

2. [x] Configuración de la cookie de sesión:
   - [x] Nombre: `session`
   - [x] HttpOnly: true
   - [x] Secure: true en producción
   - [x] SameSite: lax
   - [x] Max-Age: 7 días

## 3. Verificación de Sesión

### 3.1. Middleware de Autenticación
- [x] **Archivo:** `src/hooks.server.ts`
- [x] Verifica el token JWT en cada solicitud
- [x] Valida la versión de sesión
- [x] Carga los datos del usuario en `event.locals.user`

### 3.2. Endpoint de Verificación
- [x] **GET /api/auth/me**
- [x] Devuelve los datos del usuario autenticado
- [x] Utilizado para verificar el estado de autenticación

## 4. Manejo de Errores

### Códigos de Estado HTTP
- [x] `400`: Datos inválidos
- [x] `401`: No autenticado/Credenciales inválidas
- [x] `403`: Usuario inactivo o sin perfil
- [x] `500`: Error del servidor

### Mensajes de Error
- [x] "Credenciales inválidas"
- [x] "Usuario inactivo"
- [x] "Usuario sin perfil asociado"
- [x] "Error al procesar la solicitud"

## 5. Seguridad

### Medidas Implementadas
- [x] Contraseñas hasheadas con bcrypt
- [x] Tokens JWT firmados con clave secreta
- [x] Cookies HttpOnly para prevenir XSS
- [x] SameSite=Lax para prevenir CSRF
- [x] Versión de sesión para invalidación remota
- [x] Tiempo de expiración de sesión

## 6. Pruebas

### Pruebas con cURL
```bash
# Inicio de sesión exitoso
curl -X POST http://localhost:5174/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@ejemplo.com","password":"contraseña123"}'

# Verificar sesión
curl -X GET http://localhost:5174/api/auth/me \
  -H "Cookie: session=TOKEN_AQUI"
```

> [!NOTE]
> Las pruebas con cURL están implementadas y funcionando correctamente.

## 7. Flujo de Cierre de Sesión
1. [x] Eliminar la cookie de sesión
2. [x] Redirigir al usuario a la página de inicio

## 8. Consideraciones de UX
- [x] Feedback visual durante el envío del formulario
- [x] Mensajes de error claros y específicos
- [x] Redirección a la página solicitada originalmente
- [x] Opción "Recordarme" para sesiones persistentes
- [ ] Enlace a recuperación de contraseña
- [x] Enlace a registro para nuevos usuarios