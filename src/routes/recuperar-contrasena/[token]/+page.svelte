<script lang="ts">
    import { enhance } from '$app/forms';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { toast } from 'svelte-sonner';

    let password = '';
    let confirmPassword = '';
    let loading = false;
    let error = '';
    let success = false;
    
    export let data;
    const { token } = $page.params;

    async function handleSubmit() {
        if (!password || !confirmPassword) {
            error = 'Por favor completa todos los campos';
            return;
        }

        if (password !== confirmPassword) {
            error = 'Las contraseñas no coinciden';
            return;
        }

        if (password.length < 8) {
            error = 'La contraseña debe tener al menos 8 caracteres';
            return;
        }

        loading = true;
        error = '';

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    token,
                    password,
                    confirmPassword 
                })
            });

            const data = await response.json();

            if (response.ok) {
                success = true;
                toast.success('¡Contraseña actualizada correctamente!');
                setTimeout(() => goto('/login'), 2000);
            } else {
                error = data.message || 'Error al actualizar la contraseña';
                toast.error(error);
            }
        } catch (err) {
            console.error('Error:', err);
            error = 'Error de conexión. Por favor intenta de nuevo.';
            toast.error(error);
        } finally {
            loading = false;
        }
    }
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
        <div>
            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Restablecer Contraseña
            </h2>
            <p class="mt-2 text-center text-sm text-gray-600">
                {#if success}
                    ¡Contraseña actualizada correctamente! Redirigiendo al inicio de sesión...
                {:else}
                    Ingresa tu nueva contraseña
                {/if}
            </p>
        </div>

        {#if !success}
            <div class="mt-8 space-y-6">
                <div class="rounded-md shadow-sm -space-y-px">
                    <div>
                        <label for="password" class="sr-only">Nueva Contraseña</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autocomplete="new-password"
                            required
                            bind:value={password}
                            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="Nueva Contraseña"
                        />
                    </div>
                    <div>
                        <label for="confirm-password" class="sr-only">Confirmar Contraseña</label>
                        <input
                            id="confirm-password"
                            name="confirm-password"
                            type="password"
                            autocomplete="new-password"
                            required
                            bind:value={confirmPassword}
                            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="Confirmar Contraseña"
                        />
                    </div>
                </div>

                {#if error}
                    <div class="text-red-600 text-sm">
                        {error}
                    </div>
                {/if}

                <div>
                    <button
                        on:click={handleSubmit}
                        disabled={loading}
                        class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {#if loading}
                            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Actualizando...
                        {:else}
                            Actualizar Contraseña
                        {/if}
                    </button>
                </div>
            </div>
        {/if}

        <div class="text-center">
            <a 
                href="/login" 
                class="font-medium text-indigo-600 hover:text-indigo-500"
            >
                Volver al inicio de sesión
            </a>
        </div>
    </div>
</div>
