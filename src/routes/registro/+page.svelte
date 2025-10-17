<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  let formData = {
    dni: '',
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    usuario: '',
    clave: '',
    confirmarClave: ''
  };
  
  let error = '';
  let isLoading = false;
  let success = false;

  // Redirigir si ya está autenticado
  onMount(() => {
    if ($page.data.user) {
      goto('/admin');
    }
  });

  async function handleRegister() {
    // Validar que las contraseñas coincidan
    if (formData.clave !== formData.confirmarClave) {
      error = 'Las contraseñas no coinciden';
      return;
    }

    // Validar campos requeridos
    if (!formData.dni || !formData.nombres || !formData.apellidos || 
        !formData.email || !formData.usuario || !formData.clave) {
      error = 'Por favor complete todos los campos obligatorios';
      return;
    }

    isLoading = true;
    error = '';

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dni: formData.dni,
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          email: formData.email,
          telefono: formData.telefono || undefined,
          usuario: formData.usuario,
          clave: formData.clave
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en el registro');
      }

      // Registro exitoso
      success = true;
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        goto('/login');
      }, 2000);
      
    } catch (error) {
      console.error('Error en registro:', error);
      if (error instanceof Error) {
        error = error.message;
      } else {
        error = 'Error al registrar. Por favor intente de nuevo.';
      }
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Registro - Restaurante</title>
  <meta name="description" content="Registro de nuevo usuario en el restaurante" />
</svelte:head>

<main class="min-h-screen bg-gray-50 pb-12 px-4 sm:px-6 lg:px-8 pt-8">
  <div class="max-w-md w-full mx-auto space-y-8 bg-white p-8 rounded-lg shadow-lg">
    <div class="text-center">
      <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
        Crear Cuenta
      </h2>
      <p class="mt-2 text-sm text-gray-600">
        Complete el formulario para registrarse
      </p>
    </div>

    {#if error}
      <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">
              {error}
            </p>
          </div>
        </div>
      </div>
    {/if}

    {#if success}
      <div class="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-green-700">
              ¡Registro exitoso! Redirigiendo al inicio de sesión...
            </p>
          </div>
        </div>
      </div>
    {:else}
      <form class="mt-8 space-y-6" on:submit|preventDefault={handleRegister}>
        <div class="rounded-md shadow-sm space-y-4">
          <!-- DNI -->
          <div>
            <label for="dni" class="block text-sm font-medium text-gray-700 mb-1">DNI *</label>
            <input
              id="dni"
              name="dni"
              type="text"
              required
              bind:value={formData.dni}
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Ingrese su DNI"
            />
          </div>

          <!-- Nombres -->
          <div>
            <label for="nombres" class="block text-sm font-medium text-gray-700 mb-1">Nombres *</label>
            <input
              id="nombres"
              name="nombres"
              type="text"
              required
              bind:value={formData.nombres}
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Ingrese sus nombres"
            />
          </div>

          <!-- Apellidos -->
          <div>
            <label for="apellidos" class="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
            <input
              id="apellidos"
              name="apellidos"
              type="text"
              required
              bind:value={formData.apellidos}
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Ingrese sus apellidos"
            />
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Correo electrónico *</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              bind:value={formData.email}
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <!-- Teléfono -->
          <div>
            <label for="telefono" class="block text-sm font-medium text-gray-700 mb-1">Teléfono (opcional)</label>
            <input
              id="telefono"
              name="telefono"
              type="tel"
              bind:value={formData.telefono}
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Ingrese su teléfono"
            />
          </div>

          <!-- Usuario -->
          <div>
            <label for="usuario" class="block text-sm font-medium text-gray-700 mb-1">Nombre de usuario *</label>
            <input
              id="usuario"
              name="usuario"
              type="text"
              required
              bind:value={formData.usuario}
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Cree un nombre de usuario"
            />
          </div>

          <!-- Contraseña -->
          <div>
            <label for="clave" class="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
            <input
              id="clave"
              name="clave"
              type="password"
              required
              bind:value={formData.clave}
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Mínimo 6 caracteres"
              minlength="6"
            />
          </div>

          <!-- Confirmar Contraseña -->
          <div>
            <label for="confirmarClave" class="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña *</label>
            <input
              id="confirmarClave"
              name="confirmarClave"
              type="password"
              required
              bind:value={formData.confirmarClave}
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Vuelva a escribir su contraseña"
              minlength="6"
            />
          </div>
        </div>

        <div class="mt-6">
          <button
            type="submit"
            disabled={isLoading}
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {#if isLoading}
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Registrando...
            {:else}
              Registrarse
            {/if}
          </button>
        </div>
      </form>

      <div class="text-center">
        <p class="text-sm text-gray-600">
          ¿Ya tienes una cuenta?{' '}
          <a href="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
            Inicia sesión aquí
          </a>
        </p>
      </div>
    {/if}
  </div>
</main>
