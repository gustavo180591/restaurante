# Flujo de Registro de Usuarios

## 1. Interfaz de Usuario

### Página de Registro (`/registro`)

**Componente Principal:** `src/routes/registro/+page.svelte`

**Campos del Formulario:**
- [x] **Nombre Completo** (requerido)
- [x] **Email** (requerido, formato válido)
- [x] **Nombre de Usuario** (requerido, único)
- [x] **Contraseña** (requerido, mínimo 8 caracteres)
- [x] **Confirmar Contraseña** (debe coincidir con Contraseña)
- [x] **Tipo de Cuenta** (Cliente/Empleado)
- [x] **Términos y Condiciones** (requerido)

**Validaciones del Lado del Cliente:**
- [x] Todos los campos son obligatorios
- [x] Formato de email válido
- [x] Contraseña con mínimo 8 caracteres
- [x] Las contraseñas deben coincidir
- [x] Aceptación de términos requerida

## 2. Proceso de Registro

### 2.1. Envío de Datos
- [x] **Endpoint:** `POST /api/auth/register`
- [x] **Content-Type:** `application/json`
- [x] **Body:**
  ```json
  {
    "nombreCompleto": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "usuario": "juanperez",
    "password": "contraseñaSegura123",
    "tipoCuenta": "cliente"
  }
  ```

### 2.2. Validación en el Servidor
1. [x] Validación de campos requeridos
2. [x] Verificación de formato de email
3. [x] Comprobación de usuario/email únicos
4. [x] Validación de fortaleza de contraseña
5. [x] Verificación de términos aceptados

### 2.3. Creación del Usuario
1. [x] Hash de la contraseña con bcrypt
2. [x] Creación del registro en la tabla `Usuarios`
3. [x] Creación del perfil según tipo de cuenta (`Clientes` o `Empleados`)
4. [x] Inicialización de la versión de sesión
5. [x] Activación de la cuenta

## 3. Confirmación de Correo Electrónico (Opcional)

### 3.1. Envío de Email
- Generación de token único
- Envío de email con enlace de confirmación
- Token almacenado con fecha de expiración

### 3.2. Verificación de Cuenta
- **Endpoint:** `GET /api/auth/verify?token=TOKEN`
- Validación del token
- Activación de la cuenta
- Redirección a página de confirmación

## 4. Flujo de Activación

1. Usuario completa el formulario de registro
2. Se crea la cuenta en estado "pendiente de activación"
3. Se envía email de confirmación
4. Usuario hace clic en el enlace de confirmación
5. La cuenta se activa automáticamente
6. Usuario es redirigido al login

## 5. Manejo de Errores

### Códigos de Estado HTTP
- [x] `400`: Datos inválidos o faltantes
- [x] `409`: Usuario o email ya registrado
- [x] `422`: Validación fallida
- [x] `500`: Error del servidor

### Mensajes de Error
- [x] "El email ya está registrado"
- [x] "El nombre de usuario ya está en uso"
- [x] "Contraseña demasiado débil"
- [x] "Debes aceptar los términos y condiciones"
- [x] "Error al procesar el registro"

## 6. Seguridad

### Medidas Implementadas
- [x] Contraseñas hasheadas con bcrypt
- [x] Validación de entradas en frontend y backend
- [x] Tokens únicos para verificación de email
- [x] Protección contra fuerza bruta
- [x] Rate limiting en endpoints sensibles

## 7. Pruebas

### Pruebas con cURL
```bash
# Registro exitoso
curl -X POST http://localhost:5174/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombreCompleto": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "usuario": "juanperez",
    "password": "contraseñaSegura123",
    "tipoCuenta": "cliente"
  }'

# Verificar cuenta (simulado)
curl -X GET "http://localhost:5174/api/auth/verify?token=TOKEN_DE_VERIFICACION"
```

## 8. Consideraciones de UX
- [x] Formulario claro y conciso
- [x] Validación en tiempo real
- [x] Feedback visual durante el envío
- [x] Mensajes de error específicos
- [x] Redirección automática tras registro exitoso
- [x] Enlace a política de privacidad y términos
- [x] Opción para iniciar sesión si ya tiene cuenta

## 9. Pasos Siguientes
1. Implementar verificación por email
2. Añadir autenticación de dos factores
3. Integrar con proveedores de identidad (Google, Facebook)
4. Implementar recuperación de contraseña
5. Añadir validación de número de teléfono