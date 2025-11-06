# Flujo de Recuperación de Contraseña

## Descripción
Este documento describe el flujo de recuperación de contraseña implementado en la aplicación.

## Endpoints

### 1. Solicitar recuperación de contraseña
- **Método**: `POST /api/auth/forgot-password`
- **Body**:
  ```json
  {
    "email": "usuario@ejemplo.com"
  }
  ```
- **Respuesta exitosa (200)**:
  ```json
  {
    "success": true,
    "message": "Si el correo existe, se ha enviado un enlace de recuperación"
  }
  ```

### 2. Restablecer contraseña
- **Método**: `POST /api/auth/reset-password`
- **Body**:
  ```json
  {
    "token": "token-de-recuperacion",
    "password": "nueva-contraseña",
    "confirmPassword": "confirmar-contraseña"
  }
  ```
- **Respuesta exitosa (200)**:
  ```json
  {
    "success": true,
    "message": "Contraseña actualizada correctamente"
  }
  ```

## Flujo de trabajo

1. El usuario hace clic en "¿Olvidaste tu contraseña?" en la página de inicio de sesión.
2. Se redirige a `/recuperar-contrasena` donde ingresa su correo electrónico.
3. Al enviar el formulario, se llama a `/api/auth/forgot-password` con el correo electrónico.
4. Si el correo existe, se genera un token de recuperación y se envía un correo con un enlace.
5. El enlace redirige a `/recuperar-contrasena/[token]` donde el usuario puede ingresar su nueva contraseña.
6. Al enviar el formulario, se llama a `/api/auth/reset-password` para actualizar la contraseña.
7. Si todo es exitoso, se redirige al usuario a la página de inicio de sesión.

## Seguridad

- Los tokens de recuperación tienen una validez de 1 hora.
- Los tokens se almacenan con hash en la base de datos.
- Solo el último token generado es válido (los tokens anteriores se eliminan).
- Se utiliza `bcrypt` para el hashing de contraseñas.
- Las contraseñas deben tener al menos 8 caracteres.

## Configuración de correo

En desarrollo, se utiliza ethereal.email para pruebas. Los correos no se envían realmente, pero se pueden ver en la consola.

Para producción, configura las variables de entorno de SMTP en `.env`:

```env
# Configuración de correo para producción
SMTP_HOST="smtp.tuservidor.com"
SMTP_PORT="587"
SMTP_SECURE="false"  # "true" para SSL/TLS
SMTP_USER="tu-usuario"
SMTP_PASSWORD="tu-contraseña"
EMAIL_FROM="Tu Aplicación <noreply@tudominio.com>"
```

## Pruebas

### Prueba con cURL

1. Solicitar recuperación de contraseña:
   ```bash
   curl -X POST http://localhost:5174/api/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email":"usuario@ejemplo.com"}'
   ```

2. Restablecer contraseña (usar el token del paso anterior):
   ```bash
   curl -X POST http://localhost:5174/api/auth/reset-password \
     -H "Content-Type: application/json" \
     -d '{"token":"token-generado","password":"nueva-contraseña","confirmPassword":"nueva-contraseña"}'
   ```

## Notas

- Los correos de prueba se pueden ver en: https://ethereal.email/messages
- En producción, asegúrate de configurar correctamente el servicio SMTP.
- Considera implementar rate limiting para prevenir ataques de fuerza bruta.
