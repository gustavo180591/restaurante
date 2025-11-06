<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  
  // Password visibility toggle
  let showPassword = false;
  const togglePassword = () => {
    showPassword = !showPassword;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    if (passwordInput) {
      passwordInput.type = showPassword ? 'text' : 'password';
    }
  };
  
  let email = '';
  let password = '';
  let error = '';
  let loading = false;
  let redirectTo = '/';

  onMount(() => {
    // Get redirect URL from query params if it exists
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirectTo');
    if (redirect) {
      redirectTo = redirect;
    }
  });

  const handleSubmit = async () => {
    if (!email || !password) {
      error = 'Por favor ingrese email y contraseña';
      return;
    }

    loading = true;
    error = '';

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Error en el inicio de sesión');
      }

      // Redirect to the intended page or home
      goto(redirectTo);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Error en el inicio de sesión';
      console.error('Login error:', err);
    } finally {
      loading = false;
    }
  };
</script>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/50">
    <div>
      <h2 class="mt-6 text-center text-4xl font-bold text-amber-900 font-serif">
        Iniciar sesión
      </h2>
      <p class="mt-3 text-center text-base text-amber-800">
        O{' '}
        <a href="/register" class="font-semibold text-amber-800 hover:text-amber-700 border-b-2 border-amber-600 hover:border-amber-700 pb-0.5">
          Regístrate para crear una cuenta
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
      <input type="hidden" name="remember" value="true" />
      <div class="rounded-md shadow-sm -space-y-px">
        <div>
          <label for="email-address" class="sr-only">Email</label>
          <input
            id="email-address"
            name="email"
            type="email"
            autocomplete="email"
            required
            bind:value={email}
            class="appearance-none relative block w-full px-4 py-3 border-2 border-amber-200 placeholder-amber-400 text-amber-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-base transition duration-150 ease-in-out"
            placeholder="Correo electrónico"
          />
        </div>
        <div>
          <div class="relative">
            <label for="password" class="sr-only">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              bind:value={password}
              class="appearance-none relative block w-full px-4 pr-12 py-3 border-2 border-amber-200 placeholder-amber-400 text-amber-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-base transition duration-150 ease-in-out"
              placeholder="Contraseña"
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
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            class="h-5 w-5 text-amber-600 focus:ring-amber-500 border-2 border-amber-300 rounded focus:ring-2 focus:ring-offset-0"
          />
          <label for="remember-me" class="ml-2 block text-sm font-medium text-amber-800">
            Recordarme
          </label>
        </div>

        <div class="text-sm">
          <a href="/forgot-password" class="font-medium text-amber-700 hover:text-amber-800 hover:underline">
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </div>

      <div>
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
            Iniciando sesión...
          {:else}
            Iniciar sesión
          {/if}
        </button>
      </div>
    </form>
  </div>
</div>