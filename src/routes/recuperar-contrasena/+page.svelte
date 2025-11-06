<script lang="ts">
    import { enhance } from '$app/forms';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { toast } from 'svelte-sonner';

    let email = '';
    let loading = false;
    let success = false;
    let error = '';

    async function handleSubmit(event: SubmitEvent) {
        if (!email) {
            error = 'Por favor ingresa tu correo electrónico';
            return;
        }

        loading = true;
        error = '';

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                success = true;
                toast.success('¡Correo enviado! Por favor revisa tu bandeja de entrada.');
            } else {
                error = data.message || 'Error al procesar la solicitud';
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
                Recuperar Contraseña
            </h2>
            <p class="mt-2 text-center text-sm text-gray-600">
                {#if success}
                    Te hemos enviado un correo con las instrucciones para restablecer tu contraseña.
                {:else}
                    Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                {/if}
            </p>
        </div>

        {#if !success}
            <form class="mt-8 space-y-6" on:submit|preventDefault={handleSubmit}>
                <div class="rounded-md shadow-sm -space-y-px">
                    <div>
                        <label for="email-address" class="sr-only">Correo electrónico</label>
                        <input
                            id="email-address"
                            name="email"
                            type="email"
                            autocomplete="email"
                            required
                            bind:value={email}
                            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="Correo electrónico"
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
                        type="submit"
                        disabled={loading}
                        class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {#if loading}
                            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Enviando...
                        {:else}
                            Enviar enlace de recuperación
                        {/if}
                    </button>
                </div>
            </form>
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
