<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  
  // Form state
  let email = '';
  let dni = '';
  let name = '';
  let password = '';
  let confirmPassword = '';
  let error = '';
  let loading = false;
  let showPassword = false;
  let showConfirmPassword = false;
  
  // Password visibility toggle
  const togglePassword = () => {
    showPassword = !showPassword;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    if (passwordInput) {
      passwordInput.type = showPassword ? 'text' : 'password';
    }
  };
  
  const toggleConfirmPassword = () => {
    showConfirmPassword = !showConfirmPassword;
    const confirmPasswordInput = document.getElementById('confirmPassword') as HTMLInputElement;
    if (confirmPasswordInput) {
      confirmPasswordInput.type = showConfirmPassword ? 'text' : 'password';
    }
  };
  
  // Form validation
  const validateForm = () => {
    if (!email || !dni || !password || !confirmPassword) {
      error = 'Todos los campos son obligatorios';
      return false;
    }
    
    if (password !== confirmPassword) {
      error = 'Las contraseñas no coinciden';
      return false;
    }
    
    if (password.length < 8) {
      error = 'La contraseña debe tener al menos 8 caracteres';
      return false;
    }
    
    if (!/^[0-9]+$/.test(dni)) {
      error = 'El DNI solo debe contener números';
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      error = 'Por favor ingresa un email válido';
      return false;
    }
    
    error = '';
    return true;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    loading = true;
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          dni,
          name: name || null,
          password,
          confirmPassword
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Error en el registro');
      }

      // Redirect to login with success message
      goto('/login?registered=true');
    } catch (err) {
      console.error('Registration error:', err);
      error = err instanceof Error 
        ? err.message 
        : 'Error en el registro. Por favor, inténtalo de nuevo.';
    } finally {
      loading = false;
    }
  };
  
  // Check for success message
  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registered') === 'true') {
      // Show success message if redirected from successful registration
      error = '¡Registro exitoso! Por favor inicia sesión.';
      // Remove the query parameter from the URL
      window.history.replaceState({}, document.title, '/login');
    }
  });
</script>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/50">
    <div>
      <h2 class="text-center text-4xl font-bold text-amber-900 font-serif">
        Crear cuenta
      </h2>
      <p class="mt-3 text-center text-base text-amber-800">
        O{' '}
        <a 
          href="/login" 
          class="font-semibold text-amber-800 hover:text-amber-700 border-b-2 border-amber-600 hover:border-amber-700 pb-0.5"
        >
          inicia sesión si ya tienes una cuenta
        </a>
      </p>
    </div>
    
    {#if error}
      <div class="rounded-lg bg-red-100 border-l-4 border-red-500 p-4 shadow-sm">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">{error}</h3>
          </div>
        </div>
      </div>
    {/if}

    <form class="mt-8 space-y-6" on:submit|preventDefault={handleSubmit}>
      <div class="space-y-4">
        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-amber-800 mb-1">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            bind:value={email}
            required
            class="appearance-none relative block w-full px-4 py-3 border-2 border-amber-200 placeholder-amber-400 text-amber-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-base transition duration-150 ease-in-out"
            placeholder="tucorreo@ejemplo.com"
          />
        </div>
        
        <!-- DNI -->
        <div>
          <label for="dni" class="block text-sm font-medium text-amber-800 mb-1">
            DNI
          </label>
          <div class="relative">
            <input
              id="dni"
              type="text"
              bind:value={dni}
              required
              maxlength="8"
              class="appearance-none relative block w-full px-4 py-3 border-2 border-amber-200 placeholder-amber-400 text-amber-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-base transition duration-150 ease-in-out"
              placeholder="Ingresa tu DNI"
            />
          </div>
        </div>
        
        <!-- Nombre (opcional) -->
        <div>
          <label for="name" class="block text-sm font-medium text-amber-800 mb-1">
            Nombre completo <span class="text-amber-500">(opcional)</span>
          </label>
          <input
            id="name"
            type="text"
            bind:value={name}
            class="appearance-none relative block w-full px-4 py-3 border-2 border-amber-200 placeholder-amber-400 text-amber-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-base transition duration-150 ease-in-out"
            placeholder="Tu nombre completo"
          />
        </div>
        
        <!-- Contraseña -->
        <div>
          <label for="password" class="block text-sm font-medium text-amber-800 mb-1">
            Contraseña
          </label>
          <div class="relative">
            <input
              id="password"
              bind:value={password}
              type="password"
              required
              minlength="8"
              class="appearance-none relative block w-full px-4 pr-12 py-3 border-2 border-amber-200 placeholder-amber-400 text-amber-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-base transition duration-150 ease-in-out"
              placeholder="Mínimo 8 caracteres"
            />
            <button
              type="button"
              on:click={togglePassword}
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-amber-500 hover:text-amber-700 focus:outline-none"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {#if showPassword}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              {:else}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              {/if}
            </button>
          </div>
        </div>
        
        <!-- Confirmar Contraseña -->
        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-amber-800 mb-1">
            Confirmar Contraseña
          </label>
          <div class="relative">
            <input
              id="confirmPassword"
              bind:value={confirmPassword}
              type="password"
              required
              minlength="8"
              class="appearance-none relative block w-full px-4 pr-12 py-3 border-2 border-amber-200 placeholder-amber-400 text-amber-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-base transition duration-150 ease-in-out"
              placeholder="Vuelve a escribir tu contraseña"
            />
            <button
              type="button"
              on:click={toggleConfirmPassword}
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-amber-500 hover:text-amber-700 focus:outline-none"
              aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {#if showConfirmPassword}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              {:else}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              {/if}
            </button>
          </div>
        </div>
      </div>

      <div class="mt-6">
        <button
          type="submit"
          disabled={loading}
          class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-lg text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-150"
        >
          {#if loading}
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creando cuenta...
          {:else}
            Crear cuenta
          {/if}
        </button>
      </div>
    </form>

    <div class="text-center">
      <p class="text-sm text-amber-700">
        ¿Ya tienes una cuenta?{' '}
        <a href="/login" class="font-medium text-amber-800 hover:text-amber-900 hover:underline">
          Inicia sesión
        </a>
      </p>
    </div>
  </div>
</div>